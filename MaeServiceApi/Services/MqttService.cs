using MQTTnet;
using MaeServiceApi.Models;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;

namespace MaeServiceApi.Services
{
    public class MqttService : BackgroundService
    {
        private readonly ILogger<MqttService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly MqttOptions _options;
        private IMqttClient? _client;

        public static List<MqttMessage> RecentMessages { get; } = new();

        public MqttService(ILogger<MqttService> logger, IServiceScopeFactory scopeFactory, IOptions<MqttOptions> options)
        {
            _logger       = logger;
            _scopeFactory = scopeFactory;
            _options      = options.Value ?? new MqttOptions();
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var factory = new MqttClientFactory();
            _client     = factory.CreateMqttClient();

            var clientId = (_options.ClientIdPrefix ?? "MAEService_") + Guid.NewGuid().ToString("N");
            var optBuilder = new MqttClientOptionsBuilder()
                .WithTcpServer(_options.Host, _options.Port)
                .WithClientId(clientId)
                .WithCleanSession();

            if (_options.UseTls)
            {
                optBuilder = optBuilder.WithTlsOptions(_ => { });
            }

            if (!string.IsNullOrWhiteSpace(_options.Username))
            {
                optBuilder = optBuilder.WithCredentials(_options.Username, _options.Password);
            }

            var options = optBuilder.Build();

            _client.ApplicationMessageReceivedAsync += OnMessageReceived;

            try
            {
                await _client.ConnectAsync(options, stoppingToken);
                _logger.LogInformation("MQTT connected to {host}:{port}", _options.Host, _options.Port);

                var topics = (_options.Topics?.Length ?? 0) > 0
                    ? _options.Topics!
                    : ["maeservice/devices/+/telemetry", "maeservice/devices/+/status", "maeservice/gateway/+/heartbeat"];

                foreach (var t in topics)
                {
                    if (_client == null) break;
                    await _client.SubscribeAsync(t);
                }
                _logger.LogInformation("MQTT subscribed to {count} topic(s)", topics.Length);

                while (!stoppingToken.IsCancellationRequested)
                    await Task.Delay(1000, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning("MQTT connection failed: {msg}", ex.Message);
            }
        }

        private Task OnMessageReceived(MqttApplicationMessageReceivedEventArgs e)
        {
            var topic   = e.ApplicationMessage.Topic;
            var payloadBytes = e.ApplicationMessage.Payload;
            var payload = payloadBytes is { Length: > 0 }
                ? Encoding.UTF8.GetString(payloadBytes)
                : string.Empty;

            _logger.LogInformation("MQTT message on {topic}: {payload}", topic, payload);

            var msg = new MqttMessage
            {
                Topic     = topic,
                Payload   = payload,
                Timestamp = DateTime.UtcNow,
            };

            RecentMessages.Add(msg);
            if (RecentMessages.Count > 100)
                RecentMessages.RemoveAt(0);

            // Best-effort persistence (helps validate end-to-end stack with simulator / real uplinks).
            _ = Task.Run(() => PersistTelemetryAsync(topic, payload), CancellationToken.None);
            return Task.CompletedTask;
        }

        private async Task PersistTelemetryAsync(string topic, string payload)
        {
            try
            {
                var deviceId = TryExtractDeviceId(topic, payload) ?? "unknown";
                var value = TryExtractNumericValue(payload);
                var unit = value.HasValue ? "value" : "raw";

                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                db.Telemetry.Add(new TelemetryRecord
                {
                    DeviceId = deviceId,
                    Value = value ?? 0,
                    Unit = unit,
                    Timestamp = DateTime.UtcNow,
                    Topic = topic,
                    PayloadJson = payload
                });

                var d = await db.Devices.FirstOrDefaultAsync(x => x.DeviceId == deviceId);
                if (d == null)
                {
                    db.Devices.Add(new Device
                    {
                        DeviceId = deviceId,
                        Name = deviceId,
                        Type = "Sensor",
                        Status = "online",
                        LastSeen = DateTime.UtcNow
                    });
                }
                else
                {
                    d.LastSeen = DateTime.UtcNow;
                    d.Status = "online";
                }

                await db.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogDebug("PersistTelemetry failed: {msg}", ex.Message);
            }
        }

        private static string? TryExtractDeviceId(string topic, string payload)
        {
            var parts = topic.Split('/', StringSplitOptions.RemoveEmptyEntries);
            var devIdx = Array.FindIndex(parts, p => p.Equals("devices", StringComparison.OrdinalIgnoreCase));
            if (devIdx >= 0 && parts.Length > devIdx + 1) return parts[devIdx + 1];

            var deviceIdx = Array.FindIndex(parts, p => p.Equals("device", StringComparison.OrdinalIgnoreCase));
            if (deviceIdx >= 0 && parts.Length > deviceIdx + 1) return parts[deviceIdx + 1];

            if (parts.Length >= 4 && parts[0].Equals("v3", StringComparison.OrdinalIgnoreCase) && parts[2].Equals("devices", StringComparison.OrdinalIgnoreCase))
            {
                return parts[3];
            }

            try
            {
                using var doc = System.Text.Json.JsonDocument.Parse(payload);
                var root = doc.RootElement;
                if (root.TryGetProperty("deviceId", out var did) && did.ValueKind == System.Text.Json.JsonValueKind.String) return did.GetString();
                if (root.TryGetProperty("deviceInfo", out var di) && di.ValueKind == System.Text.Json.JsonValueKind.Object)
                {
                    if (di.TryGetProperty("deviceName", out var dn) && dn.ValueKind == System.Text.Json.JsonValueKind.String) return dn.GetString();
                    if (di.TryGetProperty("devEui", out var de) && de.ValueKind == System.Text.Json.JsonValueKind.String) return de.GetString();
                }
                if (root.TryGetProperty("end_device_ids", out var edi) && edi.ValueKind == System.Text.Json.JsonValueKind.Object)
                {
                    if (edi.TryGetProperty("device_id", out var tts) && tts.ValueKind == System.Text.Json.JsonValueKind.String) return tts.GetString();
                    if (edi.TryGetProperty("dev_eui", out var devEui) && devEui.ValueKind == System.Text.Json.JsonValueKind.String) return devEui.GetString();
                }
            }
            catch { }

            return null;
        }

        private static double? TryExtractNumericValue(string payload)
        {
            try
            {
                using var doc = System.Text.Json.JsonDocument.Parse(payload);
                var root = doc.RootElement;

                if (root.TryGetProperty("temperature", out var t) && t.TryGetDouble(out var tv)) return tv;
                if (root.TryGetProperty("value", out var v) && v.TryGetDouble(out var vv)) return vv;

                if (root.TryGetProperty("object", out var obj) && obj.ValueKind == System.Text.Json.JsonValueKind.Object)
                {
                    foreach (var p in obj.EnumerateObject())
                    {
                        if (p.Value.ValueKind == System.Text.Json.JsonValueKind.Number && p.Value.TryGetDouble(out var dv)) return dv;
                    }
                }

                if (root.TryGetProperty("uplink_message", out var um) && um.ValueKind == System.Text.Json.JsonValueKind.Object)
                {
                    if (um.TryGetProperty("decoded_payload", out var dp) && dp.ValueKind == System.Text.Json.JsonValueKind.Object)
                    {
                        foreach (var p in dp.EnumerateObject())
                        {
                            if (p.Value.ValueKind == System.Text.Json.JsonValueKind.Number && p.Value.TryGetDouble(out var dv)) return dv;
                        }
                    }
                }
            }
            catch { }

            return null;
        }

        public async Task PublishAsync(string topic, string payload)
        {
            if (_client?.IsConnected == true)
            {
                var message = new MqttApplicationMessageBuilder()
                    .WithTopic(topic)
                    .WithPayload(payload)
                    .Build();
                await _client.PublishAsync(message);
            }
        }
    }

    public class MqttMessage
    {
        public string Topic     { get; set; } = "";
        public string Payload   { get; set; } = "";
        public DateTime Timestamp { get; set; }
    }
}
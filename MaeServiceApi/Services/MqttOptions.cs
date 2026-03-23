namespace MaeServiceApi.Services
{
    public class MqttOptions
    {
        public string Host { get; set; } = "broker.hivemq.com";
        public int Port { get; set; } = 1883;
        public string ClientIdPrefix { get; set; } = "MAEService_";
        public string? Username { get; set; }
        public string? Password { get; set; }
        public bool UseTls { get; set; } = false;
        public string[] Topics { get; set; } = [];
    }
}


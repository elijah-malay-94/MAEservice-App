using Microsoft.AspNetCore.Mvc;
using MaeServiceApi.Services;
namespace MaeServiceApi.Controllers
{
    [ApiController]
    [Route("api/v2/[controller]")]
    public class MqttController : ControllerBase
    {
        private readonly MqttService _mqtt;
        public MqttController(MqttService mqtt) => _mqtt=mqtt;
        [HttpGet("messages")] public IActionResult GetMessages() => Ok(MqttService.RecentMessages.OrderByDescending(m=>m.Timestamp).Take(50));
        [HttpPost("publish")] public async Task<IActionResult> Publish([FromBody] PublishRequest req) { await _mqtt.PublishAsync(req.Topic,req.Payload); return Ok(new{success=true,topic=req.Topic}); }
        [HttpPost("simulate")] public async Task<IActionResult> Simulate() { var rng=new Random(); var devices=new[]{"MAE-001","MAE-002","MAE-003","MAE-005"}; foreach(var device in devices) { var payload=System.Text.Json.JsonSerializer.Serialize(new{deviceId=device,temperature=Math.Round(20.0+rng.NextDouble()*15,1),humidity=Math.Round(40.0+rng.NextDouble()*40,1),rssi=-60-rng.Next(0,35),battery=50+rng.Next(0,50),timestamp=DateTime.UtcNow}); await _mqtt.PublishAsync("maeservice/devices/"+device+"/telemetry",payload); } return Ok(new{success=true,message="Simulated "+devices.Length+" devices"}); }
    }
    public class PublishRequest { public string Topic{get;set;}=""; public string Payload{get;set;}=""; }
}
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MaeServiceApi.Models;
namespace MaeServiceApi.Controllers
{
    [ApiController]
    [Route("api/v2/[controller]")]
    public class TelemetryController : ControllerBase
    {
        private readonly AppDbContext _db;
        public TelemetryController(AppDbContext db) => _db=db;
        [HttpGet] public async Task<IActionResult> GetAll() => Ok(await _db.Telemetry.OrderByDescending(t=>t.Timestamp).Take(100).ToListAsync());
        [HttpGet("{deviceId}")] public async Task<IActionResult> GetByDevice(string deviceId) => Ok(await _db.Telemetry.Where(t=>t.DeviceId==deviceId).OrderByDescending(t=>t.Timestamp).Take(50).ToListAsync());
        [HttpPost] public async Task<IActionResult> Post([FromBody] TelemetryRecord r) { r.Timestamp=DateTime.UtcNow; _db.Telemetry.Add(r); await _db.SaveChangesAsync(); return CreatedAtAction(nameof(GetByDevice),new{deviceId=r.DeviceId},r); }
        [HttpGet("engine/stats")] public IActionResult GetEngineStats() { var rng=new Random(); return Ok(new{throughput=1200+rng.Next(-150,150),queueDepth=800+rng.Next(-60,60),transforms=98.1,errorRate=0.9,cpuUsage=78+rng.Next(0,8),memoryUsage=67,pipeline=new[]{new{name="Ingestion",status="online",rate="1,247 msg/s",latency="2ms",pct=97},new{name="Validation",status="online",rate="1,241 msg/s",latency="1ms",pct=95},new{name="Transformation",status="warning",rate="1,198 msg/s",latency="8ms",pct=76},new{name="Enrichment",status="online",rate="1,190 msg/s",latency="3ms",pct=93},new{name="Storage Write",status="online",rate="1,185 msg/s",latency="5ms",pct=91},new{name="Event Dispatch",status="online",rate="1,180 msg/s",latency="2ms",pct=90}}}); }
        [HttpGet("api/stats")] public IActionResult GetApiStats() { var rng=new Random(); return Ok(new{totalRps=340+rng.Next(-55,55),avgLatency=17+rng.Next(0,11),successRate=99.1,errorRate=0.9,routes=new[]{new{method="GET",path="/api/v2/devices",status="200",latency="12ms",rps=42},new{method="POST",path="/api/v2/telemetry",status="201",latency="8ms",rps=127},new{method="GET",path="/api/v2/network/status",status="200",latency="5ms",rps=18},new{method="GET",path="/api/v2/storage/stats",status="200",latency="22ms",rps=6},new{method="PUT",path="/api/v2/devices/:id/config",status="200",latency="31ms",rps=3},new{method="DELETE",path="/api/v2/sessions/:id",status="200",latency="14ms",rps=1}}}); }
    }
}
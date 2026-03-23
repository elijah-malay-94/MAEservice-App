using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MaeServiceApi.Models;
namespace MaeServiceApi.Controllers
{
    [ApiController]
    [Route("api/v2/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _db;
        public DashboardController(AppDbContext db) => _db=db;
        [HttpGet("kpi")] public async Task<IActionResult> GetKpi() { var rng=new Random(); var d=await _db.Devices.ToListAsync(); return Ok(new{mqttRate=120+rng.Next(-28,28),apiRequests=340+rng.Next(-55,55),avgLatency=17+rng.Next(0,11),activeNodes=d.Count(x=>x.Status=="online")}); }
        [HttpGet("health")] public IActionResult GetHealth() { var rng=new Random(); return Ok(new{cpu=68+rng.Next(-5,10),memory=45+rng.Next(-3,8),disk=32+rng.Next(-2,4),network=81+rng.Next(-8,8)}); }
        [HttpGet("alerts")] public async Task<IActionResult> GetAlerts() => Ok(await _db.Alerts.OrderByDescending(a=>a.Timestamp).Take(10).ToListAsync());
        [HttpGet("nodes")] public async Task<IActionResult> GetNodes() { var d=await _db.Devices.ToListAsync(); var g=await _db.Gateways.ToListAsync(); return Ok(new{devices=d,gateways=g,summary=new{total=d.Count,online=d.Count(x=>x.Status=="online"),offline=d.Count(x=>x.Status=="offline"),warning=d.Count(x=>x.Status=="warning")}}); }
        [HttpGet("messages")] public IActionResult GetMessages() => Ok(new{weekly=new[]{new{day="Mo",count=420},new{day="Tu",count=680},new{day="We",count=540},new{day="Th",count=730},new{day="Fr",count=610},new{day="Sa",count=290},new{day="Su",count=380}},stats=new{total="3.65K",delivered="98.4%",failed="0.3%",avgPerHr=521}});
    }
}
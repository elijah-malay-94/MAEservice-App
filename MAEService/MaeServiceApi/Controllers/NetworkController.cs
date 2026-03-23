using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MaeServiceApi.Models;
namespace MaeServiceApi.Controllers
{
    [ApiController]
    [Route("api/v2/[controller]")]
    public class NetworkController : ControllerBase
    {
        private readonly AppDbContext _db;
        public NetworkController(AppDbContext db) => _db=db;
        [HttpGet("gateways")] public async Task<IActionResult> GetGateways() => Ok(await _db.Gateways.ToListAsync());
        [HttpGet("gateways/{gatewayId}")] public async Task<IActionResult> GetGateway(string gatewayId) { var g=await _db.Gateways.FirstOrDefaultAsync(x=>x.GatewayId==gatewayId); return g==null?NotFound():Ok(g); }
        [HttpGet("status")] public async Task<IActionResult> GetStatus() { var g=await _db.Gateways.ToListAsync(); var rng=new Random(); return Ok(new{signalStrength=-72+rng.Next(-8,8),packetLoss=Math.Round(0.8+rng.NextDouble()*1.2,1),gatewayUptime=Math.Round(99.5+rng.NextDouble()*0.4,1),bandwidth=Math.Round(2.0+rng.NextDouble()*1.4,1),totalGateways=g.Count,onlineGateways=g.Count(x=>x.Status=="online"),protocols=new[]{new{name="MQTT",percent=52},new{name="HTTPS",percent=28},new{name="REST",percent=14},new{name="FTP",percent=6}}}); }
        [HttpGet("events")] public IActionResult GetEvents() => Ok(new[]{new{time="12:44",type="info",msg="Gateway EU-868 heartbeat received"},new{time="12:41",type="warning",msg="Packet loss spike detected 3.2%"},new{time="12:38",type="success",msg="New device MAE-007 joined network"},new{time="12:30",type="success",msg="Gateway reconnected after 2s drop"},new{time="12:18",type="info",msg="MQTT broker rebalanced"},new{time="12:05",type="success",msg="Firmware update pushed to MAE-003"},new{time="11:58",type="warning",msg="Signal degraded on MAE-004"}});
    }
}
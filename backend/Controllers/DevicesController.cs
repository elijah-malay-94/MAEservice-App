using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MaeServiceApi.Models;
namespace MaeServiceApi.Controllers
{
    [ApiController]
    [Route("api/v2/[controller]")]
    public class DevicesController : ControllerBase
    {
        private readonly AppDbContext _db;
        public DevicesController(AppDbContext db) => _db=db;
        [HttpGet] public async Task<IActionResult> GetAll() => Ok(await _db.Devices.ToListAsync());
        [HttpGet("{deviceId}")] public async Task<IActionResult> GetById(string deviceId) { var d=await _db.Devices.FirstOrDefaultAsync(d=>d.DeviceId==deviceId); return d==null?NotFound():Ok(d); }
        [HttpPost] public async Task<IActionResult> Create([FromBody] Device device) { device.LastSeen=DateTime.UtcNow; _db.Devices.Add(device); await _db.SaveChangesAsync(); return CreatedAtAction(nameof(GetById),new{deviceId=device.DeviceId},device); }
        [HttpPut("{deviceId}/config")] public async Task<IActionResult> UpdateConfig(string deviceId,[FromBody] Device u) { var d=await _db.Devices.FirstOrDefaultAsync(x=>x.DeviceId==deviceId); if(d==null)return NotFound(); d.Status=u.Status; d.Name=u.Name; d.LastSeen=DateTime.UtcNow; await _db.SaveChangesAsync(); return Ok(d); }
        [HttpDelete("{deviceId}")] public async Task<IActionResult> Delete(string deviceId) { var d=await _db.Devices.FirstOrDefaultAsync(x=>x.DeviceId==deviceId); if(d==null)return NotFound(); _db.Devices.Remove(d); await _db.SaveChangesAsync(); return NoContent(); }
        [HttpGet("status/summary")] public async Task<IActionResult> GetSummary() { var d=await _db.Devices.ToListAsync(); return Ok(new{total=d.Count,online=d.Count(x=>x.Status=="online"),offline=d.Count(x=>x.Status=="offline"),warning=d.Count(x=>x.Status=="warning")}); }
    }
}
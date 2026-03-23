using Microsoft.EntityFrameworkCore;
namespace MaeServiceApi.Models
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<Device> Devices => Set<Device>();
        public DbSet<TelemetryRecord> Telemetry => Set<TelemetryRecord>();
        public DbSet<Gateway> Gateways => Set<Gateway>();
        public DbSet<AlertRecord> Alerts => Set<AlertRecord>();
    }
    public class Device { public int Id{get;set;} public string DeviceId{get;set;}=""; public string Name{get;set;}=""; public string Type{get;set;}=""; public string Status{get;set;}=""; public string Rssi{get;set;}=""; public int MsgPerSec{get;set;} public int Battery{get;set;} public DateTime LastSeen{get;set;} }
    public class TelemetryRecord
    {
        public int Id{get;set;}
        public string DeviceId{get;set;}="";
        public double Value{get;set;}
        public string Unit{get;set;}="";
        public DateTime Timestamp{get;set;}

        // Extra fields for real integrations (LoRaWAN uplinks, raw payloads, etc.)
        public string? Topic { get; set; }
        public string? PayloadJson { get; set; }
    }
    public class Gateway { public int Id{get;set;} public string GatewayId{get;set;}=""; public string Region{get;set;}=""; public string Status{get;set;}=""; public int DeviceCount{get;set;} public string Uptime{get;set;}=""; public string Rssi{get;set;}=""; }
    public class AlertRecord { public int Id{get;set;} public string Message{get;set;}=""; public string Level{get;set;}=""; public DateTime Timestamp{get;set;} }
    public static class DbSeeder
    {
        public static void Seed(AppDbContext db)
        {
            if (db.Devices.Any()) return;
            db.Devices.AddRange(new Device{DeviceId="MAE-001",Name="Field Unit Alpha",Type="Sensor",Status="online",Rssi="-78",MsgPerSec=12,Battery=87,LastSeen=DateTime.UtcNow},new Device{DeviceId="MAE-002",Name="Field Unit Beta",Type="Sensor",Status="online",Rssi="-82",MsgPerSec=9,Battery=64,LastSeen=DateTime.UtcNow},new Device{DeviceId="MAE-003",Name="Gateway Node 1",Type="Gateway",Status="online",Rssi="-65",MsgPerSec=94,Battery=100,LastSeen=DateTime.UtcNow},new Device{DeviceId="MAE-004",Name="Remote Sensor C",Type="Sensor",Status="warning",Rssi="-95",MsgPerSec=3,Battery=22,LastSeen=DateTime.UtcNow},new Device{DeviceId="MAE-005",Name="Field Unit Delta",Type="Sensor",Status="online",Rssi="-71",MsgPerSec=15,Battery=91,LastSeen=DateTime.UtcNow},new Device{DeviceId="MAE-006",Name="Gateway Node 2",Type="Gateway",Status="online",Rssi="-60",MsgPerSec=87,Battery=100,LastSeen=DateTime.UtcNow},new Device{DeviceId="MAE-007",Name="New Device",Type="Sensor",Status="online",Rssi="-88",MsgPerSec=1,Battery=99,LastSeen=DateTime.UtcNow},new Device{DeviceId="MAE-008",Name="Remote Sensor D",Type="Sensor",Status="offline",Rssi="",MsgPerSec=0,Battery=5,LastSeen=DateTime.UtcNow});
            db.Gateways.AddRange(new Gateway{GatewayId="GW-EU-868",Region="Europe",Status="online",DeviceCount=12,Uptime="99.9%",Rssi="-65 dBm"},new Gateway{GatewayId="GW-NA-915",Region="North America",Status="online",DeviceCount=18,Uptime="99.7%",Rssi="-71 dBm"},new Gateway{GatewayId="GW-AS-923",Region="Asia Pacific",Status="warning",DeviceCount=9,Uptime="97.2%",Rssi="-88 dBm"},new Gateway{GatewayId="GW-SA-915",Region="South America",Status="online",DeviceCount=6,Uptime="98.8%",Rssi="-76 dBm"},new Gateway{GatewayId="GW-AF-868",Region="Africa",Status="online",DeviceCount=4,Uptime="98.1%",Rssi="-79 dBm"},new Gateway{GatewayId="GW-OC-915",Region="Oceania",Status="offline",DeviceCount=0,Uptime="91.3%",Rssi=""},new Gateway{GatewayId="GW-AN-433",Region="Antarctica",Status="warning",DeviceCount=2,Uptime="94.6%",Rssi="-92 dBm"});
            db.Alerts.AddRange(new AlertRecord{Message="Data Engine CPU scaling triggered",Level="warning",Timestamp=DateTime.UtcNow.AddMinutes(-3)},new AlertRecord{Message="New device registered MAE-007",Level="info",Timestamp=DateTime.UtcNow.AddMinutes(-6)},new AlertRecord{Message="FTP sync completed 128 files",Level="success",Timestamp=DateTime.UtcNow.AddMinutes(-14)},new AlertRecord{Message="Gateway EU-868 reconnected",Level="success",Timestamp=DateTime.UtcNow.AddMinutes(-29)},new AlertRecord{Message="Storage usage crossed 40GB",Level="warning",Timestamp=DateTime.UtcNow.AddMinutes(-46)});
            db.SaveChanges();
        }
    }
}
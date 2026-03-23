using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MaeServiceApi.Models;
using MaeServiceApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// Database: use SQL Server when configured; fall back to in-memory for quick dev/demo.
var sqlConn = builder.Configuration.GetConnectionString("Default");
if (!string.IsNullOrWhiteSpace(sqlConn))
{
    builder.Services.AddDbContext<AppDbContext>(opt => opt.UseSqlServer(sqlConn));
}
else
{
    builder.Services.AddDbContext<AppDbContext>(opt => opt.UseInMemoryDatabase("MaeServiceDb"));
}

builder.Services.Configure<MqttOptions>(builder.Configuration.GetSection("Mqtt"));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

var allowedOrigins =
    builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ??
    new[] { "http://localhost:5173", "http://localhost:5174" };

var allowAnyOrigin = builder.Configuration.GetValue<bool>("Cors:AllowAnyOrigin");

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
        (allowAnyOrigin
            ? policy.AllowAnyOrigin()
            : policy.WithOrigins(allowedOrigins))
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddSingleton<MqttService>();
builder.Services.AddHostedService(p => p.GetRequiredService<MqttService>());

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (!string.IsNullOrWhiteSpace(sqlConn))
    {
        db.Database.EnsureCreated();
    }
    DbSeeder.Seed(db);
}

app.MapOpenApi();
app.UseCors("AllowReact");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
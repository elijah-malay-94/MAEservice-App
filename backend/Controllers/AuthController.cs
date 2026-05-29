using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
namespace MaeServiceApi.Controllers
{
    [ApiController]
    [Route("api/v2/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        public AuthController(IConfiguration config) => _config = config;
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest req)
        {
            var users = new[]{new{Username="admin",Password="admin123",Role="Admin"},new{Username="operator",Password="operator123",Role="Operator"},new{Username="viewer",Password="viewer123",Role="Viewer"}};
            var user = users.FirstOrDefault(u => u.Username==req.Username && u.Password==req.Password);
            if (user==null) return Unauthorized(new{message="Invalid username or password"});
            var key=new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]??""));
            var creds=new SigningCredentials(key,SecurityAlgorithms.HmacSha256);
            var claims=new[]{new Claim(ClaimTypes.Name,user.Username),new Claim(ClaimTypes.Role,user.Role),new Claim(JwtRegisteredClaimNames.Jti,Guid.NewGuid().ToString())};
            var token=new JwtSecurityToken(issuer:_config["Jwt:Issuer"],audience:_config["Jwt:Audience"],claims:claims,expires:DateTime.UtcNow.AddHours(8),signingCredentials:creds);
            return Ok(new{token=new JwtSecurityTokenHandler().WriteToken(token),username=user.Username,role=user.Role,expiresIn=28800});
        }
        [HttpPost("validate")]
        public IActionResult Validate() => Ok(new{valid=true});
    }
    public class LoginRequest { public string Username{get;set;}=""; public string Password{get;set;}=""; }
}
using IdentityApi.Data;
using IdentityApi.DTOs;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace IdentityApi.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _db;

        public AuthService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<(bool IsSuccess, ClaimsPrincipal? Principal, UserDto? UserDto)> ValidateCredentialsAsync(LoginRequest request)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            
            // Dummy MVP check
            if (user == null || user.PasswordHash != request.Password)
            {
                return (false, null, null);
            }

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Role, user.Role)
            };
            
            if (!string.IsNullOrEmpty(user.TeamId))
            {
                claims.Add(new Claim("teamId", user.TeamId));
            }

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(claimsIdentity);
            
            var userDto = new UserDto(user.Id.ToString(), user.Name, user.Email, user.Role, user.TeamId);

            return (true, principal, userDto);
        }

        public UserDto? GetUserProfile(ClaimsPrincipal principal)
        {
            var id = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = principal.FindFirst(ClaimTypes.Email)?.Value;
            var name = principal.FindFirst(ClaimTypes.Name)?.Value;
            var role = principal.FindFirst(ClaimTypes.Role)?.Value;
            var teamId = principal.FindFirst("teamId")?.Value;

            if (id == null || name == null || email == null || role == null)
            {
                return null;
            }

            return new UserDto(id, name, email, role, teamId);
        }
    }
}

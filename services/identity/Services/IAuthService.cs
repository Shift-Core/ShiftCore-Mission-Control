using IdentityApi.DTOs;
using System.Security.Claims;

namespace IdentityApi.Services
{
    public interface IAuthService
    {
        Task<(bool IsSuccess, string? JwtToken, UserDto? UserDto)> ValidateCredentialsAsync(LoginRequest request);
        UserDto? GetUserProfile(ClaimsPrincipal principal);
    }
}

using IdentityApi.DTOs;
using System.Security.Claims;

namespace IdentityApi.Services
{
    public interface IAuthService
    {
        Task<(bool IsSuccess, ClaimsPrincipal? Principal, UserDto? UserDto)> ValidateCredentialsAsync(LoginRequest request);
        UserDto? GetUserProfile(ClaimsPrincipal principal);
    }
}

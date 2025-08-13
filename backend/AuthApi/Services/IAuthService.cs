using System.Threading.Tasks;
using AuthApi.Dtos;

namespace AuthApi.Services
{
    public interface IAuthService
    {
        Task<AuthResult> RegisterAsync(RegisterRequest req);
        Task<AuthResult> LoginAsync(LoginRequest req);
        bool IsStrong(string password);
    }
}

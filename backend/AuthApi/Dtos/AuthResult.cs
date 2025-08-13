namespace AuthApi.Dtos
{
    public record AuthResult(bool Success, string? Message = null, string? Token = null);
}

namespace IdentityApi.DTOs
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; } = true;
        public required string Message { get; set; }
        public T? Data { get; set; }
    }

    public class ApiErrorResponse
    {
        public bool Success { get; set; } = false;
        public required string Message { get; set; }
        public object? Data { get; set; } = null;
        public required string ErrorCode { get; set; }
        public object[] Errors { get; set; } = Array.Empty<object>();
        public required string TraceId { get; set; }
    }
}

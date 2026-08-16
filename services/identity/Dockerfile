# =============================================================================
# ShiftCore Identity API — Multi-stage Dockerfile
# Owner: Mohamed Tawfik
#
# Stages:
#   build        — restore + compile (SDK image)
#   publish      — Release publish (SDK image)
#   migrations   — dotnet ef database update runner (SDK image, exits cleanly)
#   final        — Runtime image (ASP.NET runtime, lightweight)
#
# The migrations stage is used by the identity-migrations Compose service.
# The final stage is used by the identity Compose service.
# The SDK is never present in the production runtime image.
# =============================================================================

# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["IdentityApi.csproj", "./"]
RUN dotnet restore "IdentityApi.csproj"

COPY . .
RUN dotnet build "IdentityApi.csproj" -c Release -o /app/build

# ── Stage 2: publish ─────────────────────────────────────────────────────────
FROM build AS publish
RUN dotnet publish "IdentityApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ── Stage 3: migrations ──────────────────────────────────────────────────────
# Uses the SDK image so dotnet-ef is available.
# This stage is the ENTRYPOINT for the identity-migrations Compose service.
# It runs `dotnet ef database update` against postgres and exits.
# Connection string is injected via ConnectionStrings__DefaultConnection env var.
FROM build AS migrations
WORKDIR /src

# Install dotnet-ef tool matching the EF Core package version in the project.
RUN dotnet tool install --global dotnet-ef --version 8.0.30
ENV PATH="$PATH:/root/.dotnet/tools"

ENTRYPOINT ["dotnet", "ef", "database", "update", "--no-build"]

# ── Stage 4: final (runtime) ─────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# curl is needed for the Docker healthcheck (curl -f http://127.0.0.1:5001/health)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app/dataprotection-keys

EXPOSE 5001
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "IdentityApi.dll"]

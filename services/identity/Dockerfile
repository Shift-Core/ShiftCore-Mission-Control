FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["IdentityApi.csproj", "./"]
RUN dotnet restore "IdentityApi.csproj"
COPY . .
RUN dotnet build "IdentityApi.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "IdentityApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
EXPOSE 8080
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "IdentityApi.dll"]

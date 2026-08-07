using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace IdentityApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "identity");

            migrationBuilder.CreateTable(
                name: "users",
                schema: "identity",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    team_id = table.Column<Guid>(type: "uuid", nullable: false),
                    role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "timezone('utc', now())"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "timezone('utc', now())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.id);
                });

            migrationBuilder.InsertData(
                schema: "identity",
                table: "users",
                columns: new[] { "id", "created_at", "email", "is_active", "name", "password_hash", "role", "team_id", "updated_at" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-4111-8111-111111111111"), new DateTime(2026, 8, 7, 11, 58, 46, 206, DateTimeKind.Utc).AddTicks(8272), "super@shiftcore.local", true, "Super Admin", "$2b$11$PFulOXkr4Td3YXLxoB.mLORGV6P44cWHch865DS2bBjwrkZezfawy", "Super", new Guid("00000000-0000-4000-8000-000000000001"), new DateTime(2026, 8, 7, 11, 58, 46, 206, DateTimeKind.Utc).AddTicks(8273) },
                    { new Guid("22222222-2222-4222-8222-222222222222"), new DateTime(2026, 8, 7, 11, 58, 46, 206, DateTimeKind.Utc).AddTicks(8275), "core@shiftcore.local", true, "Core Owner", "$2b$11$PFulOXkr4Td3YXLxoB.mLORGV6P44cWHch865DS2bBjwrkZezfawy", "Core", new Guid("00000000-0000-4000-8000-000000000001"), new DateTime(2026, 8, 7, 11, 58, 46, 206, DateTimeKind.Utc).AddTicks(8276) },
                    { new Guid("33333333-3333-4333-8333-333333333333"), new DateTime(2026, 8, 7, 11, 58, 46, 206, DateTimeKind.Utc).AddTicks(8278), "identity@shiftcore.local", true, "Identity Owner", "$2b$11$PFulOXkr4Td3YXLxoB.mLORGV6P44cWHch865DS2bBjwrkZezfawy", "Identity", new Guid("00000000-0000-4000-8000-000000000001"), new DateTime(2026, 8, 7, 11, 58, 46, 206, DateTimeKind.Utc).AddTicks(8279) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_users_email",
                schema: "identity",
                table: "users",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "users",
                schema: "identity");
        }
    }
}

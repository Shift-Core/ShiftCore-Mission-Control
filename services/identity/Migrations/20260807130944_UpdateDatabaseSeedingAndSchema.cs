using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IdentityApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDatabaseSeedingAndSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "identity",
                table: "users",
                keyColumn: "id",
                keyValue: new Guid("11111111-1111-4111-8111-111111111111"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 8, 7, 13, 9, 44, 525, DateTimeKind.Utc).AddTicks(5946), new DateTime(2026, 8, 7, 13, 9, 44, 525, DateTimeKind.Utc).AddTicks(5946) });

            migrationBuilder.UpdateData(
                schema: "identity",
                table: "users",
                keyColumn: "id",
                keyValue: new Guid("22222222-2222-4222-8222-222222222222"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 8, 7, 13, 9, 44, 525, DateTimeKind.Utc).AddTicks(5949), new DateTime(2026, 8, 7, 13, 9, 44, 525, DateTimeKind.Utc).AddTicks(5949) });

            migrationBuilder.UpdateData(
                schema: "identity",
                table: "users",
                keyColumn: "id",
                keyValue: new Guid("33333333-3333-4333-8333-333333333333"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 8, 7, 13, 9, 44, 525, DateTimeKind.Utc).AddTicks(5951), new DateTime(2026, 8, 7, 13, 9, 44, 525, DateTimeKind.Utc).AddTicks(5952) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "identity",
                table: "users",
                keyColumn: "id",
                keyValue: new Guid("11111111-1111-4111-8111-111111111111"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 8, 7, 11, 58, 46, 206, DateTimeKind.Utc).AddTicks(8272), new DateTime(2026, 8, 7, 11, 58, 46, 206, DateTimeKind.Utc).AddTicks(8273) });

            migrationBuilder.UpdateData(
                schema: "identity",
                table: "users",
                keyColumn: "id",
                keyValue: new Guid("22222222-2222-4222-8222-222222222222"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 8, 7, 11, 58, 46, 206, DateTimeKind.Utc).AddTicks(8275), new DateTime(2026, 8, 7, 11, 58, 46, 206, DateTimeKind.Utc).AddTicks(8276) });

            migrationBuilder.UpdateData(
                schema: "identity",
                table: "users",
                keyColumn: "id",
                keyValue: new Guid("33333333-3333-4333-8333-333333333333"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 8, 7, 11, 58, 46, 206, DateTimeKind.Utc).AddTicks(8278), new DateTime(2026, 8, 7, 11, 58, 46, 206, DateTimeKind.Utc).AddTicks(8279) });
        }
    }
}

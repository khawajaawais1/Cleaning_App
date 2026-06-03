using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Happy2CleanAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddSystemSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SystemSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkerPortalEnabled = table.Column<bool>(type: "bit", nullable: false),
                    WorkerPortalEnabledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    WorkerPortalDisabledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    WorkerPortalDisabledReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemSettings", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "SystemSettings",
                columns: new[] { "Id", "UpdatedAt", "WorkerPortalDisabledAt", "WorkerPortalDisabledReason", "WorkerPortalEnabled", "WorkerPortalEnabledAt" },
                values: new object[] { 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, false, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SystemSettings");
        }
    }
}

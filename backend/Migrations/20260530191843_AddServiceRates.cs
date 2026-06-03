using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Happy2CleanAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceRates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "PlatformFee",
                table: "SystemSettings",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "PlatformFeeType",
                table: "SystemSettings",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "ServiceRates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ServiceType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Label = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Tagline = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Icon = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    RatePerHour = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceRates", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "ServiceRates",
                columns: new[] { "Id", "DisplayOrder", "Icon", "IsActive", "Label", "RatePerHour", "ServiceType", "Tagline", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, 1, "🧹", true, "Standard clean", 25m, "StandardClean", "Regular tidy — surfaces, floors, bathrooms", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, 2, "✨", true, "Deep clean", 35m, "DeepClean", "Top to bottom — inside appliances, every corner", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, 3, "🏢", true, "Office clean", 30m, "OfficeClean", "Commercial spaces and shared areas", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 4, 4, "📦", true, "Move-out clean", 30m, "MoveInOut", "End of tenancy — deposit-back standard", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "PlatformFee", "PlatformFeeType" },
                values: new object[] { 5m, "flat" });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRates_ServiceType",
                table: "ServiceRates",
                column: "ServiceType",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ServiceRates");

            migrationBuilder.DropColumn(
                name: "PlatformFee",
                table: "SystemSettings");

            migrationBuilder.DropColumn(
                name: "PlatformFeeType",
                table: "SystemSettings");
        }
    }
}

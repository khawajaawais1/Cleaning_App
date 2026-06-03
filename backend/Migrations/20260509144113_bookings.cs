using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Happy2CleanAPI.Migrations
{
    /// <inheritdoc />
    public partial class bookings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Workers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsOnline",
                table: "Workers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PasswordHash",
                table: "Workers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PasswordHash",
                table: "Customers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "City",
                table: "Workers");

            migrationBuilder.DropColumn(
                name: "IsOnline",
                table: "Workers");

            migrationBuilder.DropColumn(
                name: "PasswordHash",
                table: "Workers");

            migrationBuilder.DropColumn(
                name: "PasswordHash",
                table: "Customers");
        }
    }
}

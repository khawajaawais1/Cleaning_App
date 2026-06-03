using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Happy2CleanAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerStripeFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CardBrand",
                table: "Customers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CardExpMonth",
                table: "Customers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CardExpYear",
                table: "Customers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CardLast4",
                table: "Customers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StripeCustomerId",
                table: "Customers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StripePaymentMethodId",
                table: "Customers",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CardBrand",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "CardExpMonth",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "CardExpYear",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "CardLast4",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "StripeCustomerId",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "StripePaymentMethodId",
                table: "Customers");
        }
    }
}

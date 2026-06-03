using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Happy2CleanAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingReviewFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CustomerRating",
                table: "Bookings",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerReview",
                table: "Bookings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReviewedAt",
                table: "Bookings",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomerRating",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "CustomerReview",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "ReviewedAt",
                table: "Bookings");
        }
    }
}

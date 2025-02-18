import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";

connect();

export async function GET() {
  try {
    // Fetch all orders
    const orders = await User.find({});

    // Initialize counters
    let totalUsers = 0;
    let totalApprovedUsers = 0;
    let totalApprovedPrice = 0;

    // First, count total users across all orders
    totalUsers = orders.reduce((count, order) => count + order.users.length, 0);

    // Extract approved users and compute stats
    const approvedUsers = orders.flatMap((order) =>
      order.users
        .filter((user: any) => user.isApproved) // Filter only approved users
        .map((user: any) => {
          totalApprovedUsers += 1; // Count total approved users
          totalApprovedPrice += user.totalPrice || 0; // Sum total approved prices

          return {
            ...user.toObject(), // Convert Mongoose document to plain object
            nic: order.index, // Assign the correct NIC from the order
          };
        })
    );

    // Filter checked-in users and map to desired details
    const checkedInUsers = approvedUsers
      .filter((user) => user.isCheckedIn)
      .map((user) => ({
        username: user.username,
        nic: user.nic, // Now correctly assigned
        checkInTime: user.checkInTime || new Date().toISOString(),
      }));

    // Calculate the number of checked-in users
    const checkedInCount = checkedInUsers.length;
    const totalCount = approvedUsers.length;

    // Calculate the check-in percentage
    const checkedInPercentage = totalCount ? (checkedInCount / totalCount) * 100 : 0;

    return NextResponse.json(
      {
        users: approvedUsers,
        checkedInUsers,
        checkedInPercentage,
        checkedInCount,
        totalCount,
        totalUsers, // Correct total number of users
        totalApprovedUsers, // Total number of approved users
        totalApprovedPrice, // Total sum of prices for approved users
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

connect();

export async function GET() {
  try {
    const orders = await User.find({});

    let totalUsers = 0;
    let approvedUsers = 0;
    let totalApprovedPrice = 0;

    // Iterate through all orders and count users
    orders.forEach((order) => {
      totalUsers += order.users.length;
      approvedUsers += order.users.filter((user: any) => user.isApproved).length;
      totalApprovedPrice += order.users
        .filter((user: any) => user.isApproved)
        .reduce((sum: number, user: any) => sum + user.totalPrice, 0);
    });

    return NextResponse.json({
      totalUsers,
      approvedUsers,
      totalApprovedPrice,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

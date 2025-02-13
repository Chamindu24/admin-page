import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";

connect();

export async function GET() {
  try {
    // Fetch all orders
    const orders = await User.find({}); 
    // Extract users from all orders and keep track of the order index
    const approvedUsers = orders.flatMap(order => 
      order.users
        .filter((user: any) => user.isApproved)  // Filter only approved users
        .map((user: any) => ({
          ...user.toObject(),  // Convert Mongoose document to plain object
          nic: order.index,  // Assign the correct NIC from the order
        }))
    );

    // Filter checked-in users and map to desired details
    const checkedInUsers = approvedUsers
      .filter(user => user.isCheckedIn)
      .map(user => ({
        username: user.username,
        nic: user.nic, // Now correctly assigned
        checkInTime: user.checkInTime || new Date().toISOString(),
      }));

     // Calculate the number of checked-in users
     const checkedInCount = checkedInUsers.length;
     const totalCount = approvedUsers.length;
 
    
    // Calculate the check-in percentage
    const checkedInPercentage = totalCount ? (checkedInCount / totalCount) * 100 : 0;

    // Return both the users and the calculated percentage
    return NextResponse.json({
      users: approvedUsers,
      checkedInUsers,
      checkedInPercentage,
      checkedInCount,
      totalCount
    });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

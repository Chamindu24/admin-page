import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
export const dynamic = "force-dynamic"; 
export const revalidate = 0; // Disables revalidation caching

// Ensure MongoDB is connected
connect();

// GET API Route - Fetch all users
export async function GET() {
  try {
    // Fetch documents with `users` and `seats`, including the top-level `index`
    const orders = await User.find().select("users seats index");

    // Flatten the data, including `index` for each user
    const flattenedData = orders.flatMap(order => 
      order.users.map((user: any, idx: number) => ({
        ...user.toObject(),          // Convert Mongoose document to plain object
        seatNumber: order.seats[idx] || "N/A", // Map seat number by index
        index: order.index || "N/A" // Add top-level `index` to each user
      }))
    );

    // Return the flattened data as JSON
    // console.log("Fetched users:", flattenedData);
    return NextResponse.json({ users: flattenedData },
                                 {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "Surrogate-Control": "no-store",
        }
      });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Error fetching users" }, { status: 500 });
  }
}


// DELETE API Route - Delete a user by ID
export async function DELETE(req: NextRequest) {
  try {
    

    // Parse the incoming request to get the user ID
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    

    if (!userId) {
      
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Find the order containing the user and remove the user
    const updatedOrder = await User.findOneAndUpdate(
      { "users._id": userId }, // Match orders where a user with this ID exists
      { $pull: { users: { _id: userId } } }, // Remove the user from the users array
      { new: true } // Return the updated document
    );

    if (!updatedOrder) {
      
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("User deleted successfully:", userId);
    return NextResponse.json(
      { message: "User deleted successfully", order: updatedOrder },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Error deleting user" }, { status: 500 });
  }
}

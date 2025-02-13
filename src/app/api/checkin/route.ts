import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";

connect();

export async function GET(request: NextRequest) {
    try {
      const url = new URL(request.url);
      const index = url.searchParams.get("index"); // Access the index query parameter
  
      console.log(`Received GET request for index: ${index}`);

    if (!index) {
      console.error("Error: Index is required");
      return NextResponse.json({ error: "Index is required" }, { status: 400 });
    }

    const userData = await User.findOne({ index }).select("users seats");
    console.log("Fetched user data:", userData);

    if (!userData) {
      console.error("Error: User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return all the necessary data
    return NextResponse.json({
        users: userData.users,
        seats: userData.seats,
        index: userData.index, // Include the index as part of the response
        department: userData.users[0]?.department, // Include department if necessary
        email: userData.users[0]?.email, // Include email if necessary
        imageURL: userData.users[0]?.imageURL, // Include imageURL if necessary
        totalPrice: userData.users[0]?.totalPrice, // Include totalPrice if necessary
      });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    try {
      const url = new URL(request.url);
      const index = url.searchParams.get("index"); // Access the index query parameter
      const { seatNumber, nic } = await request.json();
      console.log(`Received POST request for index: ${index}`);
      console.log(`Payload: seatNumber=${seatNumber}, nic=${nic}`);
  
      if (!index || !seatNumber || !nic) {
        console.error("Error: Missing required fields");
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }
  
      const userData = await User.findOne({ index });
      console.log("Fetched user data:", userData);
  
      if (!userData) {
        console.error("Error: User not found");
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
  
      
  
      
  
      // Now we have the matching seat, find the user associated with that seat
      const user = userData.users[0];
      console.log("Matching user found:", user);
  
      /*if (user.isCheckedIn) {
        console.warn("Warning: User already checked in");
        return NextResponse.json({ message: "User already checked in" });
      }
  
      user.isCheckedIn = true;
      await userData.save();
      console.log("Check-in successful for:", user);

      user.isCheckedIn = !user.isCheckedIn;*/

      if (!user) {
        console.error("Error: No user found");
        return NextResponse.json({ error: "No user found" }, { status: 404 });
      }

      // Check if the user is approved
    if (!user.isApproved) {
      console.error("Error: User is not approved for check-in");
      return NextResponse.json({ error: "User is not approved for check-in" }, { status: 403 });
    }
  
       // Toggle check-in status
    if (!user.isCheckedIn) {
        user.isCheckedIn = true;
        user.checkInTime = new Date(); // ✅ Set check-in time
        console.log(`✅ User ${user.username} checked in at:`, user.checkInTime);
      } else {
        user.isCheckedIn = false;
        user.checkInTime = null; // ✅ Reset check-in time on checkout
        console.log(`✅ User ${user.username} checked out.`);
      }
  
      await userData.save();
      return NextResponse.json({
        message: user.isCheckedIn ? "Check-in successful" : "Check-out successful",
        checkInTime: user.checkInTime,
      });

      
    } catch (error) {
      console.error("POST Error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
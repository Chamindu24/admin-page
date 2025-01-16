import { NextResponse } from 'next/server';
import User from '@/models/userModel';
import Seat from '@/models/seatModel'; // Assuming this is the Seat model file path.
import { connect } from '@/dbConfig/dbConfig';

connect();

export async function PATCH(req: Request) {
    try {
      const body = await req.json();
      const { userId } = body;
  
      if (!userId) {
        console.log("User ID is missing in the request body:", body); // Log body to debug missing userId
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
      }
  
      console.log("Attempting to update user with userId:", userId); // Log the userId being processed
      
      const updatedOrder = await User.findOneAndUpdate(
        { 'users._id': userId },
        {
            $set: {
                'users.$.isRejected': true, // Update isRejected field instead of status
                'users.$.isApproved': false,
                
            },
        },
        { new: true } // Ensure updated document is returned
    );
    console.log("Order updated:", updatedOrder);

    if (!updatedOrder) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }



    // Find the user index within the users array
    const userIndex = updatedOrder.users.findIndex(
      (user: { _id: { toString: () => string } }) => user._id.toString() === userId
    );

    if (userIndex === -1) {
        return NextResponse.json({ error: "User not found in the updated order" }, { status: 404 });
    }

    const rejectedUser = updatedOrder.users[userIndex];

    // Access seat number from the seats array using userIndex
    const seatNumber = updatedOrder.seats[userIndex];

    if (seatNumber) {
        console.log("Attempting to unbook seat:", seatNumber);

        const seatUpdateResult = await Seat.findOneAndUpdate(
            { seatNumber: seatNumber },
            { $set: { isBooked: false } },
            { new: true }
        );

        if (!seatUpdateResult) {
            console.log("Seat not found or could not be updated:", seatNumber);
        } else {
            console.log("Seat unbooked successfully:", seatUpdateResult);
        }
    } else {
        console.log("No seat number associated with the rejected user.");
    }

    return NextResponse.json({ message: "User rejected successfully." });
  } catch (error) {
    console.error("Error rejecting user:", error);
    return NextResponse.json(
        { error: "An error occurred while rejecting the user." },
        { status: 500 }
    );
  }
  }
import { NextResponse } from 'next/server';
import User from '@/models/userModel';
import Seat from '@/models/seatModel'; // Assuming this is the Seat model file path.
import { connect } from '@/dbConfig/dbConfig';
import { sendEmail } from '@/utils/mail.utils';

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

    // Send Rejection Email
    const sender = { name: "Celestia 2024", address: "chamindusathsara28@gmail.com" };
    const recipient = { name: rejectedUser.username, address: rejectedUser.email };
    const subject = "Your Order Has Been Rejected ❌";
    const emailBody = `
      <div style="font-family: Arial, sans-serif; text-align: center; max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
      <div style="background: linear-gradient(135deg, #E24A4A, #B22222); padding: 20px;">
        <h1 style="font-size: 28px; color: #fff; margin: 0;">Celestia 2024</h1>
        <h2 style="font-size: 20px; color: #FFD700; margin: 5px 0;">Rejection Notice</h2>
      </div>
      
      <div style="padding: 25px; color: #555;">
        <p style="font-size: 18px; color: #333; margin: 8px 0;">
          Hello, <strong>${rejectedUser.username}</strong>
        </p>
        <p style="font-size: 16px; line-height: 1.5; margin: 15px 0;">
          We regret to inform you that your order has been <strong style="color: #E24A4A;">rejected</strong>. If you believe this was a mistake, please contact our support team for assistance.
        </p>

        <div style="background-color: #FFECEC; padding: 15px; border-radius: 8px; margin: 20px 0; display: inline-block;">
          <p style="font-size: 16px; color: #B22222; margin: 0;">
            <strong>Seat Number:</strong> ${seatNumber ? seatNumber : "Not Assigned"}
          </p>
        </div>

        <p style="font-size: 14px; color: #888; margin: 20px 0;">
          We truly appreciate your interest in <strong>Celestia 2024</strong> and hope to see you at our future events.
        </p>
        
        
      </div>

      <div style="background-color: #f4f4f4; padding: 12px; font-size: 12px; color: #555;">
        <p style="margin: 0;">If you have any questions, simply reply to this email.</p>
      </div>
    </div>
    `;

    await sendEmail({
      sender,
      recipients: [recipient],
      subject,
      message: emailBody,
    });

    console.log(`User ${userId} rejected. Seat ${seatNumber} unbooked.`);

    return NextResponse.json({ message: "User rejected successfully." });
  } catch (error) {
    console.error("Error rejecting user:", error);
    return NextResponse.json(
        { error: "An error occurred while rejecting the user." },
        { status: 500 }
    );
  }
  }
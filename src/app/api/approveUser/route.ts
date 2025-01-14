import { NextResponse } from 'next/server';
import User from '@/models/userModel'; // User schema
import { connect } from '@/dbConfig/dbConfig';
import { sendEmail } from '@/utils/mail.utils';
import { AwesomeQR } from 'awesome-qr';

connect();

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log("Approving user with ID:", userId);

    // Find the order containing the user and update their approval status
    const updatedOrder = await User.findOneAndUpdate(
      { "users._id": userId }, // Match the order containing the user
      { $set: { "users.$.isApproved": true } }, // Update the specific user's isApproved field
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the approved user
    const approvedUser = updatedOrder.users.find((user: any) => user._id.toString() === userId);
    if (!approvedUser) {
      return NextResponse.json({ error: 'Approved user not found in the order' }, { status: 404 });
    }

    // Add `seatNumber` and `index` dynamically
    const seatIndex = updatedOrder.users.findIndex((user: any) => user._id.toString() === userId);
    const seatNumber = updatedOrder.seats[seatIndex] || "N/A";
    const index = updatedOrder.index || "N/A";

    // Append seatNumber and index to the approvedUser object
    approvedUser.seatNumber = seatNumber;
    approvedUser.index = index;



    const qrCodeData = `
    Username: ${approvedUser.username}
    Index: ${approvedUser.index}
    WhatsApp: ${approvedUser.whatsapp}
    Department: ${approvedUser.department}
    Batch: ${approvedUser.batch}
    Seat Number: ${approvedUser.seatNumber}
    Food List: ${approvedUser.foodList.join(', ')}
    Total Price: $${approvedUser.totalPrice}
  `;

    // Generate QR code using AwesomeQR
    const qrCodeBuffer = await new AwesomeQR({
      text: qrCodeData,
      size: 500,
      margin: 10,
    }).draw();

    if (!qrCodeBuffer) {
      throw new Error('Failed to generate QR code');
    }
    const qrCodeBase64 = qrCodeBuffer.toString('base64');

    // Prepare recipient email details
    const sender = { name: 'Celestia 2024', address: 'chamindusathsara28@gmail.com' };
    const recipient = { name: approvedUser.username, address: approvedUser.email };
    const subject = ' Your Order Has Been Approved! 🎉';
    const emailBody = `
  <div style="font-family: Arial, sans-serif; text-align: center; max-width: 600px; margin: auto;">
    <div style="background-color: #f9f9f9; padding: 20px;">
      <h1 style="font-size: 28px; color: #4A90E2; margin: 0;">Celestia 2024</h1>
      <h2 style="font-size: 20px; color: #333; margin: 5px 0;">Approval Notification</h2>
    </div>
    <div style="padding: 20px; color: #555;">
      <p style="font-size: 18px; color: #333; margin: 8px 0;">Greetings, <strong>${approvedUser.username}</strong>!</p>
      <p style="font-size: 16px; line-height: 1.5;">
        We are thrilled to inform you that your account has been successfully approved! Below are the details of your order:
      </p>
      <p style="font-size: 16px; color: #4A90E2; margin: 10px 0;">
        <strong>Order Details:</strong> ${approvedUser.foodList.join(', ')}
      </p>
      <p style="font-size: 16px; color: #4A90E2; margin: 10px 0;">
        <strong>Seat Number:</strong> ${approvedUser.seatNumber}
      </p>
      <div style="margin: 20px 0;">
        <img src="cid:qrcode" alt="QR Code" style="width: 200px; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);" />
      </div>
      <p style="font-size: 14px; color: #888; margin: 15px 0;">
        Thank you for choosing <strong>Celestia 2024!</strong> We can’t wait to see you at the event.
      </p>
    </div>
    <div style="background-color: #f4f4f4; padding: 10px; color: #555; font-size: 12px; margin-top: 8px;">
      <p style="margin: 0;">*** Please do not share this email or the attached QR code with anyone. ***</p>
    </div>
  </div>
`;




    const attachments = [
      {
        filename: 'qrcode.png',
        content: qrCodeBase64,
        encoding: 'base64',
        cid: 'qrcode', // Content ID for inline reference
      },
    ];

    // Send email
    const emailResult = await sendEmail({
      sender,
      recipients: [recipient],
      subject,
      message: emailBody,
      attachments,
    });

    console.log("Email sent successfully:", emailResult);

    return NextResponse.json({
      message: 'User approved and email sent successfully',
      approvedUser,
      emailResult,
    });
  } catch (error) {
    console.error('Error processing PATCH request:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}

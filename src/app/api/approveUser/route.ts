import { NextResponse } from 'next/server';
import User from '@/models/userModel';
import { connect } from '@/dbConfig/dbConfig';
import { sendEmail } from '@/utils/mail.utils';
import QRCode from 'qrcode';

connect();

const validateEnv = () => {
  const requiredEnvVars = ['MAIL_HOST', 'MAIL_PORT', 'MAIL_USER', 'MAIL_PASSWORD'];
  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
  if (missingVars.length > 0) {
    throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
  }
};

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;
    if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

    const updatedOrder = await User.findOneAndUpdate(
      { 'users._id': userId },
      { $set: { 'users.$.isApproved': true } },
      { new: true }
    );

    if (!updatedOrder) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const approvedUser = updatedOrder.users.find((user: any) => user._id.toString() === userId);
    if (!approvedUser) return NextResponse.json({ error: 'Approved user not found' }, { status: 404 });

    const seatNumber = updatedOrder.seats[updatedOrder.users.indexOf(approvedUser)] || "N/A";
    approvedUser.seatNumber = seatNumber;

    approvedUser.index=updatedOrder.index;

    // Generate QR Code
    const qrCodeData = `
      Username: ${approvedUser.username}
      WhatsApp: ${approvedUser.whatsapp}
      Department: ${approvedUser.department}
      NIC:${approvedUser.index}
    `.trim();
    
    const qrCodeBuffer = await QRCode.toBuffer(qrCodeData);
    
    // Send Email
    const sender = { name: 'Celestia 2024', address: 'chamindusathsara28@gmail.com' };
    const recipient = { name: approvedUser.username, address: approvedUser.email };
    const subject = 'Your Order Has Been Approved!';
    const emailBody = `
      <div style="font-family: Arial, sans-serif; text-align: center; max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #4A90E2, #1E66D0); padding: 20px;">
          <h1 style="font-size: 28px; color: #fff; margin: 0;">Celestia 2024</h1>
          <h2 style="font-size: 20px; color: #FFD700; margin: 5px 0;">You're Approved! 🎉</h2>
        </div>
        
        <div style="padding: 25px; color: #555;">
          <p style="font-size: 18px; color: #333; margin: 8px 0;">
            Greetings, <strong>${approvedUser.username}</strong>!
          </p>
          <p style="font-size: 16px; line-height: 1.5; margin: 15px 0;">
            We are delighted to inform you that your registration has been <strong style="color: #4A90E2;">successfully approved</strong>! Below are the details of your order:
          </p>

          <div style="background-color: #E8F4FF; padding: 15px; border-radius: 8px; margin: 20px 0; display: inline-block;">
            <p style="font-size: 16px; color: #1E66D0; margin: 0;">
              <strong>Order Details:</strong> ${approvedUser.foodList.join(', ')}
            </p>
            <p style="font-size: 16px; color: #1E66D0; margin: 10px 0;">
              <strong>Seat Number:</strong> ${approvedUser.seatNumber}
            </p>
          </div>

          <div style="margin: 20px 0;">
            <img src="cid:qrcode" alt="QR Code" style="width: 200px; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);" />
          </div>

          <p style="font-size: 14px; color: #888; margin: 20px 0;">
            Thank you for choosing <strong>Celestia 2024!</strong> We look forward to celebrating with you.
          </p>
          
          <a href="https://celestia.uomleos.org/" 
            style="display: inline-block; text-decoration: none; background-color: #4A90E2; color: #fff; padding: 12px 20px; border-radius: 5px; font-size: 16px; font-weight: bold;">
            View Event Details
          </a>
        </div>

        <div style="background-color: #f4f4f4; padding: 12px; font-size: 12px; color: #555;">
          <p style="margin: 0;">*** Please do not share this email or the attached QR code with anyone. ***</p>
        </div>
      </div>
    `;

    await sendEmail({
      sender,
      recipients: [recipient],
      subject,
      message: emailBody,
      attachments: [
        {
          filename: 'qrcode.png',
          content: qrCodeBuffer.toString('base64'),
          encoding: 'base64',
          cid: 'qrcode', // Content ID for embedding
        },
      ],
    });

    return NextResponse.json({ message: 'User approved and email sent successfully' });
  } catch (error) {
    console.error('Error in PATCH handler:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

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
    validateEnv();

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

    // Generate QR Code
    const qrCodeData = `
      Username: ${approvedUser.username}
      WhatsApp: ${approvedUser.whatsapp}
      Department: ${approvedUser.department}
    `;
    const qrCodeUrl = await QRCode.toDataURL(qrCodeData);

    // Send Email
    const sender = { name: 'Celestia 2024', address: 'chamindusathsara28@gmail.com' };
    const recipient = { name: approvedUser.username, address: approvedUser.email };
    const subject = 'Your Order Has Been Approved! 🎉';
    const emailBody = `
      <p>Hello ${approvedUser.username},</p>
      <p>Your order has been approved. Here is your QR Code:</p>
      <img src="${qrCodeUrl}" alt="QR Code" />
    `;

    await sendEmail({
      sender,
      recipients: [recipient],
      subject,
      message: emailBody,
    });

    return NextResponse.json({ message: 'User approved and email sent successfully' });
  } catch (error) {
    console.error('Error in PATCH handler:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

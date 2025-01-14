import { NextResponse } from 'next/server';
import Visitors from '@/models/visitorModel'; // Visitor schema
import { connect } from '@/dbConfig/dbConfig';
import { sendEmail } from '@/utils/mail.utils';
import qrcode from 'qrcode';

connect();

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { visitorId } = body;

    // Update the approval status
    const updatedVisitor = await Visitors.findByIdAndUpdate(
      visitorId,
      { isApproves: true },
      { new: true }
    );

    if (!updatedVisitor) {
      return NextResponse.json({ error: 'Visitor not found' }, { status: 404 });
    }

    // Generate QR Code with user details
    const qrCodeData = JSON.stringify({
      name: updatedVisitor.name,
      email: updatedVisitor.users[0]?.email,
    });
    const qrCodeBase64 = await qrcode.toDataURL(qrCodeData);

    // Prepare recipient email details
    const primaryUser = updatedVisitor.users[0];
    if (!primaryUser?.email) {
      return NextResponse.json(
        { error: 'No email found for the primary user' },
        { status: 400 }
      );
    }

    const sender = { name: 'MY APP', address: 'no-reply@myapp.com' };
    const recipients = [{ name: primaryUser.username, address: primaryUser.email }];
    const subject = 'Account Approved';
    const message = `Dear ${primaryUser.username},<br/><br/>
      Your account has been approved successfully. Below are the food details:<br/><br/>`;

    // Generate the food details list
    const foodDetails = updatedVisitor.users
      .map(
        (user: { username: string; foodList: string[]; totalprice: number }) =>
          `<strong>${user.username}</strong>: ${user.foodList.join(', ')} - Total Price: $${user.totalprice}`
      )
      .join('<br/>');

    // Prepare email body with inline QR code
    const emailBody = `
      <p>${message}</p>
      <p>${foodDetails}</p>
      <p>Attached below is your QR code:</p>
      <img src="cid:qrcode" alt="QR Code" style="width: 200px; height: auto;" />
      <p>Thank you!</p>`;

    // Prepare attachments for inline QR code
    const attachments = [
      {
        filename: 'qrcode.png',
        content: qrCodeBase64.split(',')[1], // Extract base64 content
        encoding: 'base64',
        cid: 'qrcode', // Content ID for inline reference
      },
    ];

    // Send approval email
    const result = await sendEmail({
      sender,
      recipients,
      subject,
      message: emailBody,
      attachments,
    });

    return NextResponse.json({
      message: 'Visitor approved and email sent successfully',
      visitor: updatedVisitor,
      emailResult: result,
    });
  } catch (error) {
    console.error('Error processing PATCH request:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}

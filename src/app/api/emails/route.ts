import { NextResponse } from 'next/server';
import { sendEmail } from '@/utils/mail.utils';

export async function POST(req: Request) {
  const body = await req.json();
  //const { qrCode } = body; // Get the base64-encoded QR code from the request

  const sender = {
    name: 'MY APP',
    address: 'chamindusathsara28@gmail.com',
  };

  const recipients = [
    {
      name: 'chamindu',
      address: 'chamindusathsara27@gmail.com',
    },
  ];

  try {
    const result = await sendEmail({
      sender,
      recipients,
      subject: 'Welcome to our website',
      message: 'You are welcome to the platform. Attached is your QR code.',
      
    });

    return NextResponse.json({
      accepted: result.accepted,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: 'Unable to send email this time' },
      { status: 500 }
    );
  }
}

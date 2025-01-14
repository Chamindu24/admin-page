import { NextResponse } from 'next/server';
import Visitors from '@/models/visitorModel';
import { connect } from '@/dbConfig/dbConfig';
import { sendEmail } from "@/utils/mail.utils";
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

connect();

interface VisitorDetails {
  name: string;
  index: number;
  imageURL: string;
  seats: number;
  isApproves: boolean;
  users: User[];
}

interface User {
  username: string;
  email: string;
}

async function generatePDF(visitorDetails: VisitorDetails): Promise<string> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const content = `
<html lang="en">
   <style> 
    body {
      font-family: 'Georgia', serif;
      color: #fff;
      margin: 0;
      padding: 0;
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: linear-gradient(135deg, #1a1a1a, #333); /* Dark mode gradient */
      display: flex;
      align-items: center;
      justify-content: center;
      background-size: cover;
    }

    img.bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: -1; /* Places the image behind other content */
      transition: filter 0.3s ease; /* Smooth transition for hover effect */
    }

    .container {
      max-width: 1400px; /* Increased width for larger content */
      margin: 20px auto;
      background-color: rgba(20, 20, 20, 0.95); /* Slightly darker background */
      border-radius: 20px;
      padding: 45px; /* Increased padding for better spacing */
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.8); /* Stronger shadow for a more dramatic effect */
      font-size: 1.6rem; /* Larger font size */
      line-height: 1.6; /* Improved line spacing */
    }

    h1 {
      text-align: center;
      color: #FFD700;
      font-size: 3rem; /* Increased size for prominence */
      margin-top: 0px;
      margin-bottom: 10px;
      text-shadow: 0 3px 10px rgba(255, 215, 0, 0.9);
    }

    h2 {
      text-align: center;
      color: #FF6347;
      font-size: 2rem;
      margin: 5px 0 20px 0;
      text-shadow: 0 2px 8px rgba(255, 99, 71, 0.8);
    }

    .banner-image {
      width: 100%;
      border-radius: 15px;
      margin-bottom: 30px;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.7);
    }

    .logo {
      display: block;
      margin: 0 auto 5px;
      max-width: 200px;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.7));
    }

    .visitor-details {
      margin-top: 10px;
      margin-bottom: 20px;
      padding: 10px;
      border: 1px solid #555;
      border-radius: 15px;
      background: rgba(255, 255, 255, 0.1);
      box-shadow: inset 0 0 15px rgba(255, 255, 255, 0.1);
    }

    .visitor-details p {
      font-size: 1.4rem; /* Larger text for details */
      line-height: 1.5;
      margin: 0 0 10px 0; /* Increased gap between paragraphs */
    }

    .visitor-details p span {
      font-weight: bold;
      color: #FFD700;
    }

    .visitor-details p:last-child {
      margin-bottom: 0;
    }

    .footer {
      text-align: center;
      margin-top: 40px;
      font-size: 1.2rem;
      color: #FFD700;
      font-style: italic;
      text-shadow: 0 1px 5px rgba(255, 215, 0, 0.8);
    }
    </style>
  </head>
  <body>
    <img src="=" alt="Background Image" class="bg">
     <div class="container">
    <img src="=" alt="Leo Club Logo" class="logo">
      <h1  >Celestia'24</h1 >
      <h2>A Candlelight Dinner Party</h2>

      <div class="visitor-details">
        <p><span>Name:</span> ${visitorDetails.name}</p>
        <p><span>Index:</span> ${visitorDetails.index}</p>
        <p><span>Seats Reserved:</span> ${visitorDetails.seats}</p>
        <p><span>Approval Status:</span> ${visitorDetails.isApproves ? 'Approved' : 'Not Approved'}</p>
      </div>

      <div class="footer">
        Organized by the Leo Club of the University of Moratuwa<br>
        &copy; 2024 Leo Club UOM. All rights reserved.
      </div>
    </div>
  </body>
</html>

  `;

  await page.setContent(content);
  const pdfPath = path.join(process.cwd(), `visitor_${visitorDetails.index}.pdf`);
  await page.pdf({ path: pdfPath, format: 'A4',printBackground: true });

  await browser.close();
  return pdfPath;
}

export async function POST(req: Request) {
  let newVisitor;
  try {
    const body = await req.json();

    newVisitor = new Visitors({
      name: body.name,
      index: body.index,
      imageURL: body.imageURL,
      seats: body.seats,
      isApproves: body.isApproves,
      users: body.users,
    });

    await newVisitor.save();

    const pdfPath = await generatePDF(newVisitor);

    const user = body.users[0];
    if (user?.email) {
      const sender = { name: "MY APP", address: "chamindusathsara28@gmail.com" };
      const subject = "Welcome to the platform";
      const message = `Dear ${user.username}, your account has been successfully created! Please find your visitor details attached.`;
      const recipients = [{ name: user.username, address: user.email }];

      await sendEmail({
        sender,
        recipients,
        subject,
        message,
        attachments: [
          {
            filename: `visitor_${newVisitor.index}.pdf`,
            content: fs.readFileSync(pdfPath).toString('base64'),
            encoding: 'base64',
          },
        ],
      });
    }

    return NextResponse.json(
      { message: "Visitor added successfully and email with PDF sent", visitor: newVisitor },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding visitor or sending email:", error);
    return NextResponse.json(
      { error: "Error adding visitor or sending email" },
      { status: 500 }
    );
  }
}

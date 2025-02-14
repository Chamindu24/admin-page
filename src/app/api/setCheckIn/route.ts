// src/app/api/checkin/route.ts
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

connect();

export async function POST(req: NextRequest) {
  try {
    const { username, whatsapp, department } = await req.json();

    if (!username || !whatsapp || !department) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find the user and update their check-in status
    const updatedUser = await User.findOneAndUpdate(
      { username, whatsapp, department },
      { $set: { isCheckedIn: true, checkInTime: new Date() } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found or already checked in" }, { status: 404 });
    }

    return NextResponse.json({ message: `User ${username} checked in successfully` });
  } catch (error) {
    console.error("Error in check-in API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

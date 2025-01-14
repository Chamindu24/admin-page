import { NextResponse } from "next/server";
import Visitors from "@/models/visitorModel"; // Ensure this path is correct
import { connect } from "@/dbConfig/dbConfig";



connect();

// GET method to fetch all visitors
export async function GET() {
  try {
    const visitors = await Visitors.find(); // Fetch all visitors

    if (!visitors) {
      return NextResponse.json({ error: "No visitors found" }, { status: 404 });
    }

    return NextResponse.json({ visitors }, { status: 200 });
  } catch (error) {
    console.error("Error fetching visitors:", error);
    return NextResponse.json({ error: "Error fetching visitors" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    // Parse the incoming request to get the index
    const { searchParams } = new URL(req.url);
    const index = searchParams.get("index");

    if (!index) {
      return NextResponse.json({ error: "Visitor index is required" }, { status: 400 });
    }

    // Find and delete the visitor by index
    const deletedVisitor = await Visitors.findOneAndDelete({ index });

    if (!deletedVisitor) {
      return NextResponse.json({ error: "Visitor not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Visitor deleted successfully", visitor: deletedVisitor },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting visitor:", error);
    return NextResponse.json({ error: "Error deleting visitor" }, { status: 500 });
  }
}

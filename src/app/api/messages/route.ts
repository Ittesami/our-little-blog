import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/models/Message";
import { serializeMessage } from "@/lib/serialize";
import { parseDateOnly, startOfUtcToday } from "@/lib/date";

export async function GET(request: NextRequest) {
  await connectToDatabase();
  const dateParam = request.nextUrl.searchParams.get("date");

  if (dateParam) {
    const day = parseDateOnly(dateParam);
    if (!day) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    const message = await Message.findOne({ date: day }).lean();
    return NextResponse.json({
      message: message
        ? serializeMessage(message as unknown as import("@/models/Message").IMessage)
        : null,
    });
  }

  const message = await Message.findOne({ date: { $lte: startOfUtcToday() } })
    .sort({ date: -1 })
    .lean();

  return NextResponse.json({
    message: message
      ? serializeMessage(message as unknown as import("@/models/Message").IMessage)
      : null,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const dateValue = typeof body.date === "string" ? body.date : null;

  if (!text) {
    return NextResponse.json({ error: "Message text is required" }, { status: 400 });
  }
  const day = dateValue ? parseDateOnly(dateValue) : null;
  if (!day) {
    return NextResponse.json({ error: "A valid date is required" }, { status: 400 });
  }

  await connectToDatabase();

  const message = await Message.findOneAndUpdate(
    { date: day },
    { text },
    { upsert: true, new: true }
  );

  return NextResponse.json({ message: serializeMessage(message) }, { status: 201 });
}

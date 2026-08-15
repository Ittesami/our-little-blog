import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/models/Message";
import { serializeMessage } from "@/lib/serialize";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET(request: NextRequest) {
  await connectToDatabase();
  const dateParam = request.nextUrl.searchParams.get("date");

  if (dateParam) {
    const day = startOfDay(new Date(dateParam));
    const message = await Message.findOne({ date: day }).lean();
    return NextResponse.json({
      message: message
        ? serializeMessage(message as unknown as import("@/models/Message").IMessage)
        : null,
    });
  }

  const today = startOfDay(new Date());
  const message = await Message.findOne({ date: { $lte: today } })
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
  if (!dateValue || Number.isNaN(Date.parse(dateValue))) {
    return NextResponse.json({ error: "A valid date is required" }, { status: 400 });
  }

  await connectToDatabase();
  const day = startOfDay(new Date(dateValue));

  const message = await Message.findOneAndUpdate(
    { date: day },
    { text },
    { upsert: true, new: true }
  );

  return NextResponse.json({ message: serializeMessage(message) }, { status: 201 });
}

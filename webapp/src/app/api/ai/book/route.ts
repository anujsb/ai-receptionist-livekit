// app/api/ai/book/route.ts

import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { bookCalAppointment, getAvailableSlots } from "@/lib/cal";
import { NextRequest, NextResponse } from "next/server";

// GET /api/ai/book?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
// Called by AI agent to check available slots mid-conversation
export async function GET(req: NextRequest) {
  try {
    const dateFrom = req.nextUrl.searchParams.get("dateFrom");
    const dateTo = req.nextUrl.searchParams.get("dateTo");

    if (!dateFrom || !dateTo) {
      return NextResponse.json({ error: "dateFrom and dateTo required" }, { status: 400 });
    }

    const availability = await getAvailableSlots(dateFrom, dateTo);

    const flatSlots = Object.entries(availability.slots ?? {}).flatMap(
      ([date, times]) =>
        (times as { time: string }[]).map((s) => ({
          date,
          time: s.time,
          label: new Date(s.time).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            weekday: "long",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }),
        }))
    );

    return NextResponse.json({ slots: flatSlots });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST /api/ai/book
// Called by AI agent to create a booking after collecting patient details
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      patientName,
      patientPhone,
      patientEmail,
      doctorName,
      startTime,
      callTranscript,
      notes,
    } = body;

    if (!patientName || !patientPhone || !patientEmail || !doctorName || !startTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const endTime = new Date(
      new Date(startTime).getTime() + 30 * 60000
    ).toISOString();

    const calBooking = await bookCalAppointment({
      patientName,
      patientEmail,
      patientPhone,
      startTime,
      notes,
    });

    const [created] = await db
      .insert(appointments)
      .values({
        patientName,
        patientPhone,
        patientEmail,
        doctorName,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: "confirmed",
        calBookingUid: calBooking.uid,
        calBookingUrl: `https://cal.com/booking/${calBooking.uid}`,
        bookedBy: "ai",
        callTranscript: callTranscript ?? null,
        notes: notes ?? null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      appointment: created,
      message: `Appointment confirmed for ${patientName} on ${new Date(startTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} with ${doctorName}.`,
    });
  } catch (err) {
    console.error("AI booking error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
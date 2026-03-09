// app/api/appointments/route.ts

import { db } from "@/lib/db";
import { appointments, NewAppointment } from "@/lib/db/schema";
import { bookCalAppointment } from "@/lib/cal";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET /api/appointments
export async function GET() {
  try {
    const data = await db
      .select()
      .from(appointments)
      .orderBy(desc(appointments.startTime));
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to fetch appointments:", err);
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

// POST /api/appointments
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      patientName,
      patientPhone,
      patientEmail,
      doctorName,
      startTime,
      endTime,
      notes,
      bookedBy = "manual",
      callTranscript,
    } = body;

    if (!patientName || !patientPhone || !patientEmail || !doctorName || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const calBooking = await bookCalAppointment({
      patientName,
      patientEmail,
      patientPhone,
      startTime,
      notes,
    });

    const newAppointment: NewAppointment = {
      patientName,
      patientPhone,
      patientEmail,
      doctorName,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: "confirmed",
      calBookingUid: calBooking.uid,
      calBookingUrl: `https://cal.com/booking/${calBooking.uid}`,
      bookedBy,
      callTranscript: callTranscript ?? null,
      notes: notes ?? null,
    };

    const [created] = await db.insert(appointments).values(newAppointment).returning();
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("Failed to create appointment:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
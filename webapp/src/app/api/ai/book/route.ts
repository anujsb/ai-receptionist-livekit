import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { bookCalAppointment, getAvailableSlots } from "@/lib/cal";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const dateFrom = req.nextUrl.searchParams.get("dateFrom");
    const dateTo = req.nextUrl.searchParams.get("dateTo");

    if (!dateFrom || !dateTo) {
      return NextResponse.json({ error: "dateFrom and dateTo required" }, { status: 400 });
    }

    const availability = await getAvailableSlots(dateFrom, dateTo);

    const flatSlots = Object.entries(availability.slots ?? {}).flatMap(([, times]) =>
      (times as { time: string }[]).map((s) => ({
        // exact ISO string from Cal.com — AI must use this as start_time
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      patientName,
      patientPhone,
      patientEmail,
      doctorName,
      startTime,
      notes,
      bookedBy = "ai",
    } = body;

    if (!patientName || !patientPhone || !patientEmail || !doctorName || !startTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    console.log("Booking with startTime:", startTime);

    const calBooking = await bookCalAppointment({
      patientName,
      patientEmail,
      patientPhone,
      startTime,
      notes,
    });

    const endTime = new Date(new Date(startTime).getTime() + 30 * 60000).toISOString();

    const [created] = await db
      .insert(appointments)
      .values({
        patientName,
        patientPhone,
        doctorName,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: "confirmed",
        calBookingUid: calBooking.uid,
        calBookingUrl: `https://cal.com/booking/${calBooking.uid}`,
        bookedBy,
        notes: notes ?? null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      appointment: created,
      message: `Appointment booked for ${patientName} on ${new Date(startTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} with ${doctorName}.`,
    }, { status: 201 });
  } catch (err) {
    console.error("AI booking error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
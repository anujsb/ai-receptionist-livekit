// app/api/appointments/[id]/route.ts

import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { cancelCalAppointment } from "@/lib/cal";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// PATCH /api/appointments/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const [updated] = await db
      .update(appointments)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE /api/appointments/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [appt] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id));

    if (!appt) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    if (appt.calBookingUid) {
      await cancelCalAppointment(appt.calBookingUid);
    }

    const [cancelled] = await db
      .update(appointments)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();

    return NextResponse.json(cancelled);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

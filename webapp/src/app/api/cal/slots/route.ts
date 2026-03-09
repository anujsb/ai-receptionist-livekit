// app/api/cal/slots/route.ts

import { getAvailableSlots } from "@/lib/cal";
import { NextRequest, NextResponse } from "next/server";

// GET /api/cal/slots?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
export async function GET(req: NextRequest) {
  try {
    const dateFrom = req.nextUrl.searchParams.get("dateFrom");
    const dateTo = req.nextUrl.searchParams.get("dateTo");

    if (!dateFrom || !dateTo) {
      return NextResponse.json(
        { error: "dateFrom and dateTo are required" },
        { status: 400 }
      );
    }

    const slots = await getAvailableSlots(dateFrom, dateTo);
    return NextResponse.json(slots);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
import { db } from "@/lib/db";
import { clinicSettings } from "@/lib/db/schema";
import { DEFAULT_SETTINGS } from "./defaults";
import { NextRequest, NextResponse } from "next/server";

// GET /api/settings — fetch current settings (or return defaults)
export async function GET() {
  try {
    const rows = await db.select().from(clinicSettings).limit(1);

    if (rows.length === 0) {
      // Seed defaults on first load
      const [created] = await db
        .insert(clinicSettings)
        .values({ settings: DEFAULT_SETTINGS })
        .returning();
      return NextResponse.json(created.settings);
    }

    return NextResponse.json(rows[0].settings);
  } catch (err) {
    console.error("Settings GET error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PUT /api/settings — update settings
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const rows = await db.select().from(clinicSettings).limit(1);

    let updated;
    if (rows.length === 0) {
      [updated] = await db
        .insert(clinicSettings)
        .values({ settings: body })
        .returning();
    } else {
      [updated] = await db
        .update(clinicSettings)
        .set({ settings: body, updatedAt: new Date() })
        .returning();
    }

    return NextResponse.json(updated.settings);
  } catch (err) {
    console.error("Settings PUT error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
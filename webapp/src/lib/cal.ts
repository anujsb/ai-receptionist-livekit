// lib/cal.ts

const CAL_API_BASE = "https://api.cal.com/v1";
const CAL_API_KEY = process.env.CAL_API_KEY!;
const CAL_USERNAME = process.env.CAL_USERNAME!;
const CAL_EVENT_TYPE_SLUG = process.env.CAL_EVENT_TYPE_SLUG!;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CalSlot {
  time: string;
}

export interface CalAvailabilityResponse {
  slots: Record<string, CalSlot[]>;
}

export interface CalBookingRequest {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  startTime: string;
  notes?: string;
}

export interface CalBookingResponse {
  uid: string;
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getEventTypeId(): Promise<number> {
  const res = await fetch(`${CAL_API_BASE}/event-types?apiKey=${CAL_API_KEY}`);
  const data = await res.json();
  console.log("Cal event types:", JSON.stringify(data)); // add this
  const eventType = data.event_types?.find(
    (et: { slug: string }) => et.slug === CAL_EVENT_TYPE_SLUG
  );
  if (!eventType) throw new Error(`Event type "${CAL_EVENT_TYPE_SLUG}" not found on Cal.com`);
  return eventType.id;
}

// ─── Get available slots ──────────────────────────────────────────────────────

export async function getAvailableSlots(
  dateFrom: string,
  dateTo: string
): Promise<CalAvailabilityResponse> {
  const eventTypeId = await getEventTypeId();
  const url = new URL(`${CAL_API_BASE}/slots`);
  url.searchParams.set("apiKey", CAL_API_KEY);
  url.searchParams.set("eventTypeId", String(eventTypeId));
  url.searchParams.set("usernameList", CAL_USERNAME);
  url.searchParams.set("startTime", `${dateFrom}T00:00:00Z`);
  url.searchParams.set("endTime", `${dateTo}T23:59:59Z`);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Cal.com slots error: ${res.statusText}`);
  return res.json();
}

// ─── Book appointment ─────────────────────────────────────────────────────────

export async function bookCalAppointment(
  req: CalBookingRequest
): Promise<CalBookingResponse> {
  const eventTypeId = await getEventTypeId();

  const body = {
    eventTypeId,
    start: req.startTime,
    responses: {
      name: req.patientName,
      email: req.patientEmail,
      phone: req.patientPhone,
      notes: req.notes ?? "",
    },
    timeZone: "Asia/Kolkata",
    language: "en",
    metadata: {},
  };

  const res = await fetch(`${CAL_API_BASE}/bookings?apiKey=${CAL_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cal.com booking failed: ${err}`);
  }

  return res.json();
}

// ─── Cancel appointment ───────────────────────────────────────────────────────

export async function cancelCalAppointment(uid: string): Promise<void> {
  const res = await fetch(
    `${CAL_API_BASE}/bookings/${uid}/cancel?apiKey=${CAL_API_KEY}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error(`Cal.com cancel error: ${res.statusText}`);
}
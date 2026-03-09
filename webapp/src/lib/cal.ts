const CAL_API_BASE = "https://api.cal.com/v1";

function getEnv() {
  const key = process.env.CAL_API_KEY;
  const username = process.env.CAL_USERNAME;
  const slug = process.env.CAL_EVENT_TYPE_SLUG;
  console.log("[cal.ts] ENV CHECK:", { hasKey: !!key, username, slug });
  if (!key || !username || !slug) throw new Error("Missing CAL_API_KEY, CAL_USERNAME or CAL_EVENT_TYPE_SLUG in .env.local");
  return { key, username, slug };
}

export interface CalSlot {
  time: string;
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

async function getEventTypeId(): Promise<number> {
  const { key, slug } = getEnv();
  const res = await fetch(`${CAL_API_BASE}/event-types?apiKey=${key}`);
  const data = await res.json();

  const list: { slug: string; id: number }[] = data.event_types ?? [];
  console.log("[cal.ts] Available slugs:", list.map((e) => e.slug));

  const found = list.find((et) => et.slug === slug);
  if (!found) throw new Error(`Event type slug "${slug}" not found. Available: ${list.map((e) => e.slug).join(", ")}`);
  return found.id;
}

export async function getAvailableSlots(
  dateFrom: string,
  dateTo: string
): Promise<{ slots: Record<string, CalSlot[]> }> {
  const { key, username } = getEnv();
  const eventTypeId = await getEventTypeId();

  const url = new URL(`${CAL_API_BASE}/slots`);
  url.searchParams.set("apiKey", key);
  url.searchParams.set("eventTypeId", String(eventTypeId));
  url.searchParams.set("usernameList", username);
  url.searchParams.set("startTime", `${dateFrom}T00:00:00Z`);
  url.searchParams.set("endTime", `${dateTo}T23:59:59Z`);

  const res = await fetch(url.toString());
  const data = await res.json();
  console.log("[cal.ts] Slots keys:", Object.keys(data.slots ?? {}));

  if (!res.ok) throw new Error(`Cal.com slots error: ${JSON.stringify(data)}`);
  return data;
}

export async function bookCalAppointment(req: CalBookingRequest): Promise<CalBookingResponse> {
  const { key } = getEnv();
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

  const res = await fetch(`${CAL_API_BASE}/bookings?apiKey=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Cal.com booking failed: ${JSON.stringify(data)}`);
  return data;
}

export async function cancelCalAppointment(uid: string): Promise<void> {
  const { key } = getEnv();
  const res = await fetch(`${CAL_API_BASE}/bookings/${uid}/cancel?apiKey=${key}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Cal.com cancel error: ${res.statusText}`);
}
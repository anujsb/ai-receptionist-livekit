import { pgTable, text, timestamp, uuid, pgEnum, jsonb } from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);

export const bookedByEnum = pgEnum("booked_by", ["ai", "manual"]);

// ─── Appointments ─────────────────────────────────────────────────────────────

export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Patient info
  patientName: text("patient_name").notNull(),
  patientPhone: text("patient_phone").notNull(),

  // Doctor info
  doctorName: text("doctor_name").notNull(),

  // Appointment details
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  status: appointmentStatusEnum("status").default("confirmed").notNull(),

  // Cal.com reference
  calBookingUid: text("cal_booking_uid"),
  calBookingUrl: text("cal_booking_url"),

  // Meta
  bookedBy: bookedByEnum("booked_by").default("manual").notNull(),
  callTranscript: text("call_transcript"),
  notes: text("notes"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;

// ─── Settings types ───────────────────────────────────────────────────────────

export interface ClinicHours {
  enabled: boolean;
  open: string;   // "09:00"
  close: string;  // "19:00"
}

export interface EscalationRule {
  id: string;
  trigger: string;
  action: string;
}

export interface ClinicSettingsData {
  // Identity
  clinicName: string;
  doctorName: string;
  clinicAddress: string;
  clinicPhone: string;

  // AI Behavior
  greetingMessage: string;
  responseTone: "formal" | "friendly" | "neutral";
  language: string;
  fallbackResponse: string;

  // Hours - keyed by day index "0"=Sun .. "6"=Sat
  hours: Record<string, ClinicHours>;

  // Booking rules
  appointmentDuration: number;
  maxAdvanceBookingDays: number;

  // Escalation
  escalationRules: EscalationRule[];
}

// ─── Clinic Settings ──────────────────────────────────────────────────────────

export const clinicSettings = pgTable("clinic_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  settings: jsonb("settings").notNull().$type<ClinicSettingsData>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ClinicSettingsRow = typeof clinicSettings.$inferSelect;
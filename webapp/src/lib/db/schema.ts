import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);

export const bookedByEnum = pgEnum("booked_by", ["ai", "manual"]);

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
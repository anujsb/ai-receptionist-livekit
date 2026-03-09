import { ClinicSettingsData } from "@/lib/db/schema";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const DEFAULT_SETTINGS: ClinicSettingsData = {
  clinicName: "Sharma Clinic",
  doctorName: "Dr. Sharma",
  clinicAddress: "123 MG Road, Pune, Maharashtra 411001",
  clinicPhone: "+91 98765 43210",

  greetingMessage:
    "Hello! Thank you for calling Sharma Clinic. I'm Receptra, your AI receptionist. How can I help you today?",
  responseTone: "friendly",
  language: "English",
  fallbackResponse:
    "I'm sorry, I wasn't able to help with that. Please leave your name and number and our staff will call you back shortly.",

  hours: Object.fromEntries(
    DAYS.map((_, i) => [
      String(i),
      {
        enabled: i !== 0, // closed Sunday
        open: "09:00",
        close: "19:00",
      },
    ])
  ),

  appointmentDuration: 30,
  maxAdvanceBookingDays: 14,

  escalationRules: [
    {
      id: "1",
      trigger: "Patient mentions emergency or chest pain or difficulty breathing",
      action: "Immediately advise calling 112 or going to nearest emergency room. Do not attempt to book appointment.",
    },
    {
      id: "2",
      trigger: "Patient is very upset or angry",
      action: "Apologize sincerely, offer to have a staff member call them back, and provide the clinic phone number.",
    },
    {
      id: "3",
      trigger: "AI cannot understand the patient after 2 attempts",
      action: "Politely ask the patient to call back during clinic hours to speak with a staff member directly.",
    },
  ],
};
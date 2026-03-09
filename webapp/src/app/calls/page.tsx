"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Phone,
  PhoneIncoming,
  PhoneMissed,
  Clock,
  User,
  ChevronDown,
  ChevronRight,
  Bot,
  Search,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

type CallStatus = "completed" | "missed" | "no_booking";

interface Call {
  id: string;
  callerName: string;
  callerPhone: string;
  startedAt: string;
  duration: number; // seconds
  status: CallStatus;
  bookedAppointment: boolean;
  transcript: string | null;
}

// Mock data — replace with real DB calls later
const MOCK_CALLS: Call[] = [
  {
    id: "1",
    callerName: "Priya Mehta",
    callerPhone: "+91 98201 34567",
    startedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    duration: 183,
    status: "completed",
    bookedAppointment: true,
    transcript: "Patient: Hi, I'd like to book an appointment with Dr. Sharma tomorrow.\nAI: Sure! I have slots available at 10 AM and 11 AM tomorrow. Which works for you?\nPatient: 10 AM please.\nAI: Perfect, I'll need your email to confirm...",
  },
  {
    id: "2",
    callerName: "Rahul Desai",
    callerPhone: "+91 87654 32109",
    startedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    duration: 94,
    status: "completed",
    bookedAppointment: false,
    transcript: "Patient: What are the clinic timings?\nAI: The clinic is open Monday to Saturday, 9 AM to 7 PM. Is there anything else I can help you with?\nPatient: No, that's fine. Thanks.",
  },
  {
    id: "3",
    callerName: "Unknown",
    callerPhone: "+91 70000 11223",
    startedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    duration: 0,
    status: "missed",
    bookedAppointment: false,
    transcript: null,
  },
  {
    id: "4",
    callerName: "Sunita Rao",
    callerPhone: "+91 91234 56789",
    startedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    duration: 247,
    status: "completed",
    bookedAppointment: true,
    transcript: "Patient: I need to reschedule my appointment...",
  },
  {
    id: "5",
    callerName: "Amit Kulkarni",
    callerPhone: "+91 99887 76655",
    startedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    duration: 312,
    status: "completed",
    bookedAppointment: true,
    transcript: "Patient: Hello, I'd like to book for my wife...",
  },
  {
    id: "6",
    callerName: "Unknown",
    callerPhone: "+91 88776 55443",
    startedAt: new Date(Date.now() - 26 * 3600000).toISOString(),
    duration: 0,
    status: "missed",
    bookedAppointment: false,
    transcript: null,
  },
];

const statusConfig: Record<CallStatus, { label: string; icon: React.ReactNode; color: string }> = {
  completed: {
    label: "Completed",
    icon: <PhoneIncoming size={12} />,
    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
  },
  missed: {
    label: "Missed",
    icon: <PhoneMissed size={12} />,
    color: "text-red-500 bg-red-50 border-red-100",
  },
  no_booking: {
    label: "No Booking",
    icon: <Phone size={12} />,
    color: "text-stone-500 bg-stone-50 border-stone-200",
  },
};

function formatDuration(secs: number) {
  if (secs === 0) return "—";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function CallsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | CallStatus>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = MOCK_CALLS.filter((c) => {
    const matchSearch =
      c.callerName.toLowerCase().includes(search.toLowerCase()) ||
      c.callerPhone.includes(search);
    const matchFilter = filter === "all" || c.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    all: MOCK_CALLS.length,
    completed: MOCK_CALLS.filter((c) => c.status === "completed").length,
    missed: MOCK_CALLS.filter((c) => c.status === "missed").length,
    no_booking: MOCK_CALLS.filter((c) => c.status === "no_booking").length,
  };

  return (
    <AppLayout>
      <div className="px-8 py-8 max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-semibold text-stone-900 text-2xl tracking-tight">Calls</h1>
          <p className="mt-1 text-stone-400 text-sm">All incoming calls handled by Receptra</p>
        </div>

        {/* Stats row */}
        <div className="gap-4 grid grid-cols-3 mb-6">
          {[
            { label: "Total Calls", value: MOCK_CALLS.length, sub: "all time" },
            { label: "Appointments Booked", value: MOCK_CALLS.filter((c) => c.bookedAppointment).length, sub: "via AI calls" },
            { label: "Missed Calls", value: MOCK_CALLS.filter((c) => c.status === "missed").length, sub: "needs follow-up" },
          ].map((s) => (
            <div key={s.label} className="bg-white px-5 py-4 border border-stone-200/80 rounded-2xl">
              <p className="font-semibold text-stone-900 text-2xl">{s.value}</p>
              <p className="mt-0.5 text-stone-500 text-xs">{s.label}</p>
              <p className="mt-0.5 text-[11px] text-stone-300">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Filters + search */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="top-1/2 left-3 absolute text-stone-300 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white py-2 pr-4 pl-9 border border-stone-200 focus:border-stone-400 rounded-xl focus:outline-none w-full text-stone-700 placeholder:text-stone-300 text-sm transition-colors"
            />
          </div>
          <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
            {(["all", "completed", "missed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${
                  filter === tab ? "bg-white text-stone-900 font-medium shadow-sm" : "text-stone-400 hover:text-stone-600"
                }`}
              >
                {tab} <span className="opacity-50">{counts[tab]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Calls list */}
        <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-stone-300 text-sm text-center">No calls found</div>
          ) : (
            <div className="divide-y divide-stone-50">
              {filtered.map((call) => {
                const status = statusConfig[call.status];
                const isOpen = expanded === call.id;

                return (
                  <div key={call.id}>
                    <div
                      className="flex items-center gap-4 hover:bg-stone-50/60 px-6 py-4 transition-colors cursor-pointer"
                      onClick={() => setExpanded(isOpen ? null : call.id)}
                    >
                      {/* Avatar */}
                      <div className="flex justify-center items-center bg-stone-100 rounded-full w-9 h-9 shrink-0">
                        <User size={15} className="text-stone-400" />
                      </div>

                      {/* Caller */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-stone-800 text-sm truncate">{call.callerName}</p>
                        <p className="text-stone-400 text-xs">{call.callerPhone}</p>
                      </div>

                      {/* Time */}
                      <div className="text-right shrink-0">
                        <p className="text-stone-600 text-xs">{format(new Date(call.startedAt), "MMM d, h:mm a")}</p>
                        <div className="flex justify-end items-center gap-1 mt-0.5 text-stone-400">
                          <Clock size={10} />
                          <span className="text-[11px]">{formatDuration(call.duration)}</span>
                        </div>
                      </div>

                      {/* Booked badge */}
                      <div className="w-24 text-right shrink-0">
                        {call.bookedAppointment && (
                          <span className="flex justify-center items-center gap-1 bg-violet-50 px-2 py-0.5 border border-violet-100 rounded-full text-[11px] text-violet-500">
                            <Bot size={10} /> Booked
                          </span>
                        )}
                      </div>

                      {/* Status */}
                      <div className="shrink-0">
                        <span className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border ${status.color}`}>
                          {status.icon} {status.label}
                        </span>
                      </div>

                      {/* Expand */}
                      <div className="text-stone-300 shrink-0">
                        {call.transcript
                          ? isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                          : <span className="block w-4" />
                        }
                      </div>
                    </div>

                    {/* Transcript drawer */}
                    {isOpen && call.transcript && (
                      <div className="bg-stone-50/50 px-6 pb-5 border-stone-100 border-t">
                        <p className="mt-4 mb-2 text-[11px] text-stone-400 uppercase tracking-wider">Transcript</p>
                        <div className="bg-white p-4 border border-stone-100 rounded-xl font-mono text-stone-600 text-xs leading-relaxed whitespace-pre-wrap">
                          {call.transcript}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
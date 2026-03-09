"use client";

import { useEffect, useState } from "react";
import { format, isToday, isTomorrow } from "date-fns";
import {
  CalendarDays,
  PhoneCall,
  CheckCircle2,
  TrendingUp,
  Clock,
  User,
  Stethoscope,
  Bot,
  ArrowRight,
  Activity,
} from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";

interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  startTime: string;
  endTime: string;
  status: string;
  bookedBy: string;
}

const statCards = [
  {
    label: "Today's Appointments",
    key: "today",
    icon: CalendarDays,
    color: "bg-violet-50 text-violet-600",
    suffix: "",
  },
  {
    label: "Total Calls",
    key: "calls",
    icon: PhoneCall,
    color: "bg-blue-50 text-blue-600",
    suffix: "",
  },
  {
    label: "Bookings via AI",
    key: "aiBookings",
    icon: Bot,
    color: "bg-emerald-50 text-emerald-600",
    suffix: "",
  },
  {
    label: "Success Rate",
    key: "successRate",
    icon: TrendingUp,
    color: "bg-amber-50 text-amber-600",
    suffix: "%",
  },
];

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/appointments")
      .then((r) => r.json())
      .then((data) => setAppointments(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const todayAppts = appointments.filter((a) => isToday(new Date(a.startTime)));
  const aiBooked = appointments.filter((a) => a.bookedBy === "ai").length;
  const confirmed = appointments.filter((a) => a.status === "confirmed" || a.status === "completed").length;
  const successRate = appointments.length > 0 ? Math.round((confirmed / appointments.length) * 100) : 0;

  const stats = {
    today: todayAppts.length,
    calls: 48, // placeholder
    aiBookings: aiBooked,
    successRate,
  };

  const upcoming = appointments
    .filter((a) => new Date(a.startTime) >= new Date() && a.status !== "cancelled")
    .slice(0, 5);

  return (
    <AppLayout>
      <div className="px-8 py-8 max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-semibold text-stone-900 text-2xl tracking-tight">
            Good morning, Dr. Sharma
          </h1>
          <p className="mt-1 text-stone-400 text-sm">
            {format(new Date(), "EEEE, MMMM d, yyyy")} · Here's what's happening today
          </p>
        </div>

        {/* Stat cards */}
        <div className="gap-4 grid grid-cols-4 mb-8">
          {statCards.map(({ label, key, icon: Icon, color, suffix }) => (
            <div
              key={key}
              className="relative bg-white p-5 border border-stone-200/80 rounded-2xl overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon size={16} />
                </div>
              </div>
              <p className="font-semibold text-stone-900 text-3xl tracking-tight">
                {loading ? "—" : stats[key as keyof typeof stats]}{suffix}
              </p>
              <p className="mt-1 text-stone-400 text-xs">{label}</p>
            </div>
          ))}
        </div>

        <div className="gap-5 grid grid-cols-3">
          {/* Upcoming appointments */}
          <div className="col-span-2 bg-white border border-stone-200/80 rounded-2xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-stone-100 border-b">
              <h2 className="font-medium text-stone-900 text-sm">Upcoming Appointments</h2>
              <Link href="/appointments" className="flex items-center gap-1 text-stone-400 hover:text-stone-700 text-xs transition-colors">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-stone-50">
              {loading ? (
                <div className="px-6 py-8 text-stone-300 text-sm text-center">Loading...</div>
              ) : upcoming.length === 0 ? (
                <div className="px-6 py-8 text-stone-300 text-sm text-center">No upcoming appointments</div>
              ) : (
                upcoming.map((appt) => {
                  const start = new Date(appt.startTime);
                  const dateLabel = isToday(start) ? "Today" : isTomorrow(start) ? "Tomorrow" : format(start, "MMM d");
                  return (
                    <div key={appt.id} className="flex items-center gap-4 hover:bg-stone-50/60 px-6 py-3.5 transition-colors">
                      <div className="w-12 text-center shrink-0">
                        <p className="text-[10px] text-stone-400 uppercase tracking-wider">{dateLabel}</p>
                        <p className="font-semibold text-stone-800 text-sm">{format(start, "h:mm")}</p>
                        <p className="text-[10px] text-stone-400">{format(start, "a")}</p>
                      </div>
                      <div className="bg-stone-100 w-px h-8 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <User size={12} className="text-stone-300 shrink-0" />
                          <p className="font-medium text-stone-800 text-sm truncate">{appt.patientName}</p>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Stethoscope size={11} className="text-stone-300 shrink-0" />
                          <p className="text-stone-400 text-xs truncate">{appt.doctorName}</p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {appt.bookedBy === "ai" ? (
                          <span className="flex items-center gap-1 bg-violet-50 px-2 py-0.5 border border-violet-100 rounded-full text-[11px] text-violet-500">
                            <Bot size={10} /> AI
                          </span>
                        ) : (
                          <span className="bg-stone-50 px-2 py-0.5 border border-stone-100 rounded-full text-[11px] text-stone-400">
                            Manual
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            {/* Today summary */}
            <div className="relative bg-stone-900 p-5 rounded-2xl overflow-hidden text-white">
              <div className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                  backgroundSize: "100px",
                }}
              />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={14} className="text-stone-400" />
                  <span className="text-stone-400 text-xs uppercase tracking-wider">AI Status</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-emerald-400 rounded-full w-2 h-2 animate-pulse" />
                  <span className="font-medium text-sm">Agent Online</span>
                </div>
                <p className="mb-5 text-stone-400 text-xs">Receptra is active and taking calls</p>
                <Link href="/demo" className="flex justify-center items-center gap-2 bg-white/10 hover:bg-white/15 py-2 border border-white/10 rounded-xl w-full font-medium text-xs transition-colors">
                  Open Demo <ArrowRight size={11} />
                </Link>
              </div>
            </div>

            {/* Recent activity */}
            <div className="flex-1 bg-white border border-stone-200/80 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-stone-100 border-b">
                <h2 className="font-medium text-stone-900 text-sm">Recent Activity</h2>
              </div>
              <div className="flex flex-col gap-3 px-5 py-3">
                {[
                  { label: "AI booked appointment", sub: "2 min ago", dot: "bg-violet-400" },
                  { label: "Call completed", sub: "14 min ago", dot: "bg-blue-400" },
                  { label: "Appointment cancelled", sub: "1 hr ago", dot: "bg-red-300" },
                  { label: "New patient registered", sub: "2 hrs ago", dot: "bg-emerald-400" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${item.dot}`} />
                    <div>
                      <p className="text-stone-700 text-xs">{item.label}</p>
                      <p className="text-[11px] text-stone-400">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Today's schedule strip */}
        {todayAppts.length > 0 && (
          <div className="bg-white mt-5 border border-stone-200/80 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-stone-100 border-b">
              <Clock size={14} className="text-stone-400" />
              <h2 className="font-medium text-stone-900 text-sm">Today's Schedule</h2>
              <span className="bg-stone-100 ml-auto px-2 py-0.5 rounded-full text-stone-500 text-xs">{todayAppts.length} appointments</span>
            </div>
            <div className="flex gap-0 divide-x divide-stone-100 overflow-x-auto">
              {todayAppts.map((appt) => (
                <div key={appt.id} className="px-5 py-4 min-w-[160px] shrink-0">
                  <p className="font-semibold text-stone-800 text-xs">{format(new Date(appt.startTime), "h:mm a")}</p>
                  <p className="mt-1 text-stone-600 text-xs truncate">{appt.patientName}</p>
                  <p className="text-[11px] text-stone-400 truncate">{appt.doctorName}</p>
                  <span className={`mt-2 inline-block text-[10px] px-1.5 py-0.5 rounded-full ${
                    appt.status === "confirmed" ? "bg-emerald-50 text-emerald-600" : "bg-stone-100 text-stone-400"
                  }`}>
                    {appt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
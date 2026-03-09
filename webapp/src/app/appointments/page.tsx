"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Phone,
  User,
  Stethoscope,
  Plus,
  Bot,
  UserCheck,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";
type BookedBy = "ai" | "manual";

interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  calBookingUid: string | null;
  calBookingUrl: string | null;
  bookedBy: BookedBy;
  callTranscript: string | null;
  notes: string | null;
  createdAt: string;
}

interface Slot {
  time: string;
}

const statusConfig: Record<AppointmentStatus, { label: string; color: string; icon: React.ReactNode }> = {
  confirmed: { label: "Confirmed", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: <CheckCircle2 size={12} /> },
  pending: { label: "Pending", color: "text-amber-400 bg-amber-400/10 border-amber-400/20", icon: <AlertCircle size={12} /> },
  cancelled: { label: "Cancelled", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: <XCircle size={12} /> },
  completed: { label: "Completed", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: <CheckCircle2 size={12} /> },
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<"all" | AppointmentStatus>("all");
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this appointment? This will also cancel it on Cal.com.")) return;
    setCancelling(id);
    try {
      await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      await fetchAppointments();
    } finally {
      setCancelling(null);
    }
  };

  const filtered = filter === "all"
    ? appointments
    : appointments.filter((a) => a.status === filter);

  const counts = {
    all: appointments.length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    pending: appointments.filter((a) => a.status === "pending").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
    completed: appointments.filter((a) => a.status === "completed").length,
  };

  return (
    <div className="bg-[#080810] min-h-screen text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Grain overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "128px" }} />

      <div className="mx-auto px-6 py-10 max-w-6xl">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="font-semibold text-2xl tracking-tight">Appointments</h1>
            <p className="mt-1 text-white/40 text-sm">{appointments.length} total bookings</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-white hover:bg-white/90 px-4 py-2.5 rounded-xl font-medium text-black text-sm active:scale-95 transition-all"
          >
            <Plus size={16} />
            Book Manually
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-white/5 mb-6 p-1 border border-white/5 rounded-xl w-fit">
          {(["all", "confirmed", "pending", "completed", "cancelled"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm capitalize transition-all ${
                filter === tab
                  ? "bg-white text-black font-medium"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {tab} {counts[tab] > 0 && <span className="opacity-60 ml-1">{counts[tab]}</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 size={24} className="text-white/30 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-32 text-white/20">
            <Calendar size={40} className="mb-4" />
            <p className="text-sm">No appointments found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appt={appt}
                onCancel={handleCancel}
                cancelling={cancelling === appt.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Manual booking modal */}
      {showModal && (
        <BookingModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchAppointments();
          }}
        />
      )}
    </div>
  );
}

function AppointmentCard({
  appt,
  onCancel,
  cancelling,
}: {
  appt: Appointment;
  onCancel: (id: string) => void;
  cancelling: boolean;
}) {
  const status = statusConfig[appt.status];
  const start = new Date(appt.startTime);
  const end = new Date(appt.endTime);

  return (
    <div className="group flex items-center gap-6 bg-white/[0.03] hover:bg-white/[0.05] p-5 border border-white/[0.06] hover:border-white/10 rounded-2xl transition-all">

      {/* Date block */}
      <div className="flex-shrink-0 w-14 text-center">
        <p className="text-white/30 text-xs uppercase tracking-widest">{format(start, "MMM")}</p>
        <p className="font-light text-3xl leading-none">{format(start, "d")}</p>
        <p className="mt-1 text-white/30 text-xs">{format(start, "EEE")}</p>
      </div>

      <div className="flex-shrink-0 bg-white/10 w-px h-12" />

      {/* Time */}
      <div className="flex-shrink-0 w-28">
        <div className="flex items-center gap-1.5 text-white/60 text-sm">
          <Clock size={13} />
          {format(start, "h:mm a")}
        </div>
        <div className="mt-1 text-white/30 text-xs">→ {format(end, "h:mm a")}</div>
      </div>

      {/* Patient */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <User size={13} className="text-white/40" />
          <span className="font-medium text-sm truncate">{appt.patientName}</span>
        </div>
        <div className="flex items-center gap-2 text-white/40 text-xs">
          <Phone size={11} />
          {appt.patientPhone}
        </div>
      </div>

      {/* Doctor */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Stethoscope size={13} className="text-white/40" />
          <span className="text-sm truncate">{appt.doctorName}</span>
        </div>
      </div>

      {/* Booked by */}
      <div className="flex-shrink-0">
        <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
          appt.bookedBy === "ai"
            ? "text-violet-400 bg-violet-400/10 border-violet-400/20"
            : "text-slate-400 bg-slate-400/10 border-slate-400/20"
        }`}>
          {appt.bookedBy === "ai" ? <Bot size={11} /> : <UserCheck size={11} />}
          {appt.bookedBy === "ai" ? "AI Booked" : "Manual"}
        </span>
      </div>

      {/* Status */}
      <div className="flex-shrink-0">
        <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${status.color}`}>
          {status.icon}
          {status.label}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-shrink-0 items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {appt.calBookingUrl && (
          <a
            href={appt.calBookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:bg-white/10 p-2 rounded-lg text-white/40 hover:text-white transition-colors"
            title="View on Cal.com"
          >
            <ExternalLink size={14} />
          </a>
        )}
        {appt.status !== "cancelled" && appt.status !== "completed" && (
          <button
            onClick={() => onCancel(appt.id)}
            disabled={cancelling}
            className="hover:bg-red-500/10 disabled:opacity-50 p-2 rounded-lg text-white/40 hover:text-red-400 transition-colors"
            title="Cancel appointment"
          >
            {cancelling ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}

function BookingModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [slots, setSlots] = useState<Record<string, Slot[]>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const today = format(new Date(), "yyyy-MM-dd");
  const weekLater = format(new Date(Date.now() + 7 * 86400000), "yyyy-MM-dd");

  const [form, setForm] = useState({
    patientName: "",
    patientPhone: "",
    patientEmail: "",
    doctorName: "",
    startTime: "",
    notes: "",
  });

  useEffect(() => {
    setLoadingSlots(true);
    fetch(`/api/cal/slots?dateFrom=${today}&dateTo=${weekLater}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? {}))
      .catch(() => setError("Failed to load available slots"))
      .finally(() => setLoadingSlots(false));
  }, []);

  const allSlots = Object.entries(slots).flatMap(([date, times]) =>
    times.map((s) => ({ label: format(new Date(s.time), "EEE MMM d, h:mm a"), value: s.time }))
  );

  const selectedSlot = allSlots.find((s) => s.value === form.startTime);
  const endTime = form.startTime
    ? new Date(new Date(form.startTime).getTime() + 30 * 60000).toISOString()
    : "";

  const handleSubmit = async () => {
    setError("");
    if (!form.patientName || !form.patientPhone || !form.patientEmail || !form.doctorName || !form.startTime) {
      setError("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, endTime, bookedBy: "manual" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Booking failed");
      }
      onSuccess();
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0f0f1a] shadow-2xl p-6 border border-white/10 rounded-2xl w-full max-w-lg">

        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold text-lg">Book Appointment</h2>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-lg transition-colors">
            <X size={16} className="text-white/50" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Patient info */}
          <div className="gap-3 grid grid-cols-2">
            <Field label="Patient Name *" value={form.patientName} onChange={(v) => setForm({ ...form, patientName: v })} placeholder="John Doe" />
            <Field label="Phone *" value={form.patientPhone} onChange={(v) => setForm({ ...form, patientPhone: v })} placeholder="+91 98765 43210" />
          </div>
          <Field label="Email *" value={form.patientEmail} onChange={(v) => setForm({ ...form, patientEmail: v })} placeholder="patient@email.com" type="email" />
          <Field label="Doctor Name *" value={form.doctorName} onChange={(v) => setForm({ ...form, doctorName: v })} placeholder="Dr. Sharma" />

          {/* Slot picker */}
          <div>
            <label className="block mb-1.5 text-white/40 text-xs uppercase tracking-wider">
              Available Slot *
            </label>
            {loadingSlots ? (
              <div className="flex items-center gap-2 py-3 text-white/30 text-sm">
                <Loader2 size={14} className="animate-spin" /> Loading slots...
              </div>
            ) : (
              <select
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="bg-white/5 px-4 py-2.5 border border-white/10 focus:border-white/30 rounded-xl focus:outline-none w-full text-white text-sm transition-colors"
              >
                <option value="">Select a time slot</option>
                {allSlots.map((s) => (
                  <option key={s.value} value={s.value} className="bg-[#0f0f1a]">
                    {s.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          <Field label="Notes (optional)" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} placeholder="Reason for visit..." />

          {error && (
            <p className="bg-red-400/10 px-3 py-2 border border-red-400/20 rounded-lg text-red-400 text-xs">
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-white/10 hover:border-white/20 rounded-xl text-white/50 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex flex-1 justify-center items-center gap-2 bg-white hover:bg-white/90 disabled:opacity-50 py-2.5 rounded-xl font-medium text-black text-sm active:scale-95 transition-all"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
              {submitting ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block mb-1.5 text-white/40 text-xs uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-white/5 px-4 py-2.5 border border-white/10 focus:border-white/30 rounded-xl focus:outline-none w-full text-white placeholder:text-white/20 text-sm transition-colors"
      />
    </div>
  );
}
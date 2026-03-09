import Link from "next/link";
import {
  PhoneCall,
  CalendarCheck,
  BrainCircuit,
  Clock,
  ShieldCheck,
  ChevronRight,
  Activity,
  Star,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div
      className="bg-[#fafaf8] min-h-screen text-stone-900"
      style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
    >
      {/* Grain texture overlay */}
      <div
        className="z-10 fixed inset-0 opacity-[0.022] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px",
        }}
      />

      {/* Nav */}
      <nav className="z-20 relative flex justify-between items-center mx-auto px-8 py-5 max-w-6xl">
        <div className="flex items-center gap-2.5">
          <div className="flex justify-center items-center bg-stone-900 rounded-lg w-7 h-7">
            <Activity size={14} className="text-white" />
          </div>
          <span className="font-semibold text-stone-900 tracking-tight" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
            Receptra
          </span>
        </div>
        <div className="flex items-center gap-6" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
          <Link href="#how" className="text-stone-500 hover:text-stone-800 text-sm transition-colors">How it works</Link>
          <Link href="#features" className="text-stone-500 hover:text-stone-800 text-sm transition-colors">Features</Link>
          <Link href="/dashboard" className="text-stone-500 hover:text-stone-800 text-sm transition-colors">Dashboard</Link>
          <Link
            href="/demo"
            className="bg-stone-900 hover:bg-stone-700 px-4 py-2 rounded-xl text-white text-sm transition-colors"
          >
            Try Demo
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="z-20 relative mx-auto px-8 pt-16 pb-20 max-w-6xl">
        <div className="max-w-3xl">
          {/* Pill */}
          <div className="inline-flex items-center gap-2 bg-white shadow-sm mb-8 px-3 py-1.5 border border-stone-200 rounded-full"
            style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
            <div className="bg-emerald-400 rounded-full w-1.5 h-1.5 animate-pulse" />
            <span className="text-stone-500 text-xs">AI Receptionist — Available 24/7</span>
          </div>

          <h1 className="mb-6 font-normal text-stone-900 text-6xl leading-[1.08] tracking-tight">
            Never miss a patient
            <br />
            <em className="text-stone-400">call again.</em>
          </h1>

          <p className="mb-10 max-w-xl text-stone-500 text-lg leading-relaxed"
            style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
            Receptra answers every call, books appointments on Cal.com, and notifies your team — automatically. So your staff can focus on care, not phones.
          </p>

          <div className="flex items-center gap-4" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
            <Link
              href="/demo"
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-700 shadow-sm px-6 py-3 rounded-xl font-medium text-white text-sm transition-all"
            >
              Try live demo <ChevronRight size={14} />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-white px-6 py-3 border border-stone-200 hover:border-stone-400 rounded-xl text-stone-700 text-sm transition-all"
            >
              View dashboard
            </Link>
          </div>
        </div>

        {/* Hero visual */}
        <div className="bg-white shadow-stone-200/40 shadow-xl mt-16 border border-stone-200/80 rounded-3xl overflow-hidden">
          {/* Fake browser chrome */}
          <div className="flex items-center gap-2 bg-stone-50 px-5 py-3.5 border-stone-100 border-b">
            <div className="flex gap-1.5">
              <div className="bg-red-300 rounded-full w-2.5 h-2.5" />
              <div className="bg-amber-300 rounded-full w-2.5 h-2.5" />
              <div className="bg-emerald-300 rounded-full w-2.5 h-2.5" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white mx-auto px-3 py-1 border border-stone-200 rounded-lg w-48 text-[11px] text-stone-400 text-center"
                style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
                clinic.receptra.ai/demo
              </div>
            </div>
          </div>

          {/* Mock call UI */}
          <div className="bg-gradient-to-b from-white to-stone-50/50 p-8">
            <div className="mx-auto max-w-md">
              <div className="mb-6 text-center">
                <div className="flex justify-center items-center bg-stone-100 mx-auto mb-3 rounded-full w-14 h-14">
                  <PhoneCall size={22} className="text-stone-400" />
                </div>
                <p className="font-medium text-stone-700 text-sm" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>Incoming call · +91 98201 34567</p>
                <div className="flex justify-center items-center gap-1.5 mt-1">
                  <div className="bg-emerald-400 rounded-full w-1.5 h-1.5 animate-pulse" />
                  <p className="text-stone-400 text-xs" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>AI Receptionist answering</p>
                </div>
              </div>

              {/* Fake transcript */}
              <div className="flex flex-col gap-2.5" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
                {[
                  { role: "ai", text: "Hello! Thank you for calling. How can I help you today?" },
                  { role: "patient", text: "I'd like to book an appointment with Dr. Sharma tomorrow." },
                  { role: "ai", text: "Of course! I have slots at 10:00 AM, 11:30 AM, and 2:00 PM tomorrow. Which works for you?" },
                  { role: "patient", text: "10 AM please." },
                  { role: "ai", text: "Perfect! Booking confirmed for tomorrow at 10:00 AM. You'll receive a confirmation shortly." },
                ].map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "patient" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                      msg.role === "ai"
                        ? "bg-white border border-stone-200 text-stone-700 rounded-tl-sm"
                        : "bg-stone-900 text-white rounded-tr-sm"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Booked confirmation */}
              <div className="flex items-center gap-2 bg-emerald-50 mt-4 px-4 py-2.5 border border-emerald-100 rounded-xl" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
                <CalendarCheck size={14} className="text-emerald-500 shrink-0" />
                <p className="text-emerald-700 text-xs">Appointment booked · Cal.com updated · Confirmation sent</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos / social proof */}
      <section className="z-20 relative bg-white py-6 border-stone-100 border-y"
        style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
        <div className="flex justify-between items-center mx-auto px-8 max-w-6xl">
          <p className="text-stone-400 text-xs uppercase tracking-widest">Trusted by clinics using</p>
          <div className="flex items-center gap-8 text-stone-300">
            {["Cal.com", "OpenAI", "LiveKit", "Neon DB"].map((t) => (
              <span key={t} className="font-medium text-sm">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="z-20 relative mx-auto px-8 py-24 max-w-6xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-stone-400 text-xs uppercase tracking-widest"
            style={{ fontFamily: "'Instrument Sans', sans-serif" }}>How it works</p>
          <h2 className="font-normal text-stone-900 text-4xl">Simple as a phone call</h2>
        </div>

        <div className="gap-5 grid grid-cols-4" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
          {[
            { n: "01", title: "Patient calls", desc: "Receptra picks up instantly, 24/7 — no hold music, no missed calls." },
            { n: "02", title: "AI understands", desc: "Natural conversation — the AI understands booking requests, questions, and more." },
            { n: "03", title: "Slot suggested", desc: "Receptra checks real-time availability on Cal.com and offers open slots." },
            { n: "04", title: "Auto-confirmed", desc: "Appointment is booked, calendar updated, and confirmation sent to patient." },
          ].map((step) => (
            <div key={step.n} className="group relative bg-white hover:shadow-sm p-6 border border-stone-200/80 hover:border-stone-300 rounded-2xl overflow-hidden transition-all">
              <span className="top-4 right-5 absolute font-light text-stone-100 group-hover:text-stone-150 text-4xl transition-colors select-none"
                style={{ fontFamily: "'Instrument Serif', serif" }}>
                {step.n}
              </span>
              <h3 className="z-10 relative mb-2 font-semibold text-stone-800">{step.title}</h3>
              <p className="z-10 relative text-stone-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="z-20 relative relative bg-stone-900 py-24 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "100px",
          }}
        />
        <div className="z-10 relative mx-auto px-8 max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-stone-500 text-xs uppercase tracking-widest"
              style={{ fontFamily: "'Instrument Sans', sans-serif" }}>Features</p>
            <h2 className="font-normal text-white text-4xl">Built for modern clinics</h2>
          </div>

          <div className="gap-5 grid grid-cols-3" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
            {[
              { icon: BrainCircuit, title: "Real-time AI voice", desc: "Powered by OpenAI Realtime API — natural, low-latency voice conversations that feel human." },
              { icon: CalendarCheck, title: "Cal.com integration", desc: "Checks live availability and books directly into your Cal.com calendar. No double bookings." },
              { icon: Clock, title: "24/7 availability", desc: "Your clinic is always reachable. Never miss a patient call, even outside business hours." },
              { icon: PhoneCall, title: "Call transcripts", desc: "Every conversation is logged with a full transcript for your records and review." },
              { icon: ShieldCheck, title: "HIPAA-conscious", desc: "Built with patient privacy in mind. Secure data handling throughout the call flow." },
              { icon: Activity, title: "Live dashboard", desc: "Monitor calls, appointments, and AI performance in one clean dashboard." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/5 hover:bg-white/8 p-6 border border-white/10 rounded-2xl transition-colors">
                <div className="flex justify-center items-center bg-white/10 mb-4 rounded-xl w-9 h-9">
                  <Icon size={16} className="text-stone-300" />
                </div>
                <h3 className="mb-2 font-semibold text-white">{title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="z-20 relative mx-auto px-8 py-24 max-w-6xl">
        <div className="bg-white shadow-sm mx-auto p-10 border border-stone-200/80 rounded-3xl max-w-2xl text-center">
          <div className="flex justify-center gap-0.5 mb-5">
            {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" className="text-amber-400" />)}
          </div>
          <blockquote className="mb-6 font-normal text-stone-700 text-xl leading-relaxed">
            "We went from missing 30% of calls to zero missed bookings. Our staff now focuses entirely on patients, not phones."
          </blockquote>
          <div style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
            <p className="font-semibold text-stone-800 text-sm">Dr. Ananya Krishnan</p>
            <p className="text-stone-400 text-xs">Founder, Wellness First Clinic, Pune</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="z-20 relative mx-auto px-8 pb-24 max-w-6xl">
        <div className="relative bg-stone-900 p-12 rounded-3xl overflow-hidden text-center">
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "100px",
            }}
          />
          <div className="z-10 relative">
            <h2 className="mb-4 font-normal text-white text-4xl">Ready to automate your front desk?</h2>
            <p className="mx-auto mb-8 max-w-md text-stone-400"
              style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
              Set up in minutes. No hardware. No training. Just plug in your Cal.com and go.
            </p>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 bg-white hover:bg-stone-100 px-8 py-3.5 rounded-xl font-medium text-stone-900 text-sm transition-colors"
              style={{ fontFamily: "'Instrument Sans', sans-serif" }}
            >
              Try the demo now <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="z-20 relative py-8 border-stone-100 border-t"
        style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
        <div className="flex justify-between items-center mx-auto px-8 max-w-6xl">
          <div className="flex items-center gap-2">
            <div className="flex justify-center items-center bg-stone-900 rounded-md w-6 h-6">
              <Activity size={11} className="text-white" />
            </div>
            <span className="font-medium text-stone-600 text-sm">Receptra</span>
          </div>
          <p className="text-stone-400 text-xs">© 2026 Receptra. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
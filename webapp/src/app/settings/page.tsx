"use client";

import { useEffect, useState } from "react";
import {
    Building2,
    Bot,
    Clock,
    CalendarDays,
    AlertTriangle,
    Save,
    Plus,
    Trash2,
    Loader2,
    CheckCircle2,
    ChevronDown,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { ClinicSettingsData, EscalationRule, ClinicHours } from "@/lib/db/schema";
import { Switch } from "@/components/ui/switch";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TABS = [
    { id: "general", label: "General", icon: Building2 },
    { id: "ai", label: "AI Behavior", icon: Bot },
    { id: "hours", label: "Clinic Hours", icon: Clock },
    { id: "booking", label: "Booking Rules", icon: CalendarDays },
    { id: "escalation", label: "Escalation", icon: AlertTriangle },
] as const;

type TabId = typeof TABS[number]["id"];

export default function SettingsPage() {
    const [tab, setTab] = useState<TabId>("general");
    const [settings, setSettings] = useState<ClinicSettingsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/settings")
            .then((r) => r.json())
            .then((data) => setSettings(data))
            .catch(() => setError("Failed to load settings"))
            .finally(() => setLoading(false));
    }, []);

    const update = (patch: Partial<ClinicSettingsData>) => {
        setSettings((prev) => prev ? { ...prev, ...patch } : prev);
    };

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        setError("");
        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            if (!res.ok) throw new Error("Save failed");
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            setError(String(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppLayout>
            <div
                className="px-8 py-8 max-w-5xl"
                style={{ fontFamily: "'Instrument Sans', 'DM Sans', sans-serif" }}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="font-semibold text-stone-900 text-2xl tracking-tight">Settings</h1>
                        <p className="mt-1 text-stone-400 text-sm">Control AI behavior and clinic configuration</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="flex items-center gap-2 bg-stone-900 hover:bg-stone-700 disabled:opacity-50 px-4 py-2.5 rounded-xl font-medium text-white text-sm active:scale-95 transition-all"
                    >
                        {saving ? (
                            <><Loader2 size={14} className="animate-spin" /> Saving...</>
                        ) : saved ? (
                            <><CheckCircle2 size={14} className="text-emerald-400" /> Saved</>
                        ) : (
                            <><Save size={14} /> Save Changes</>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 mb-5 px-4 py-3 border border-red-100 rounded-xl text-red-500 text-xs">
                        {error}
                    </div>
                )}

                <div className="flex gap-6">
                    {/* Sidebar tabs */}
                    <div className="flex flex-col gap-0.5 w-44 shrink-0">
                        {TABS.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setTab(id)}
                                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-all ${tab === id
                                    ? "bg-stone-900 text-white font-medium"
                                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                                    }`}
                            >
                                <Icon size={15} />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {loading ? (
                            <div className="flex justify-center items-center py-24">
                                <Loader2 size={20} className="text-stone-300 animate-spin" />
                            </div>
                        ) : settings ? (
                            <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden">
                                {tab === "general" && <GeneralTab settings={settings} update={update} />}
                                {tab === "ai" && <AIBehaviorTab settings={settings} update={update} />}
                                {tab === "hours" && <HoursTab settings={settings} update={update} />}
                                {tab === "booking" && <BookingTab settings={settings} update={update} />}
                                {tab === "escalation" && <EscalationTab settings={settings} update={update} />}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

// ─── Tab: General ─────────────────────────────────────────────────────────────

function GeneralTab({ settings, update }: TabProps) {
    return (
        <Section title="Clinic Identity" description="Basic information about your clinic shown to patients.">
            <Field label="Clinic Name" hint="Used in AI greetings and confirmations">
                <Input value={settings.clinicName} onChange={(v) => update({ clinicName: v })} placeholder="Sharma Clinic" />
            </Field>
            <Field label="Primary Doctor" hint="Default doctor name when patient doesn't specify">
                <Input value={settings.doctorName} onChange={(v) => update({ doctorName: v })} placeholder="Dr. Sharma" />
            </Field>
            <Field label="Clinic Address" hint="Shared with patients who ask for directions">
                <Input value={settings.clinicAddress} onChange={(v) => update({ clinicAddress: v })} placeholder="123 MG Road, Pune" />
            </Field>
            <Field label="Clinic Phone" hint="Given to patients when escalating or for callbacks">
                <Input value={settings.clinicPhone} onChange={(v) => update({ clinicPhone: v })} placeholder="+91 98765 43210" />
            </Field>
        </Section>
    );
}

// ─── Tab: AI Behavior ─────────────────────────────────────────────────────────

function AIBehaviorTab({ settings, update }: TabProps) {
    return (
        <>
            <Section title="Voice & Tone" description="How the AI presents itself during calls.">
                <Field label="Greeting Message" hint="First thing the AI says when a patient calls">
                    <Textarea
                        value={settings.greetingMessage}
                        onChange={(v) => update({ greetingMessage: v })}
                        rows={3}
                        placeholder="Hello! Thank you for calling..."
                    />
                </Field>
                <Field label="Response Tone">
                    <Select
                        value={settings.responseTone}
                        onChange={(v) => update({ responseTone: v as ClinicSettingsData["responseTone"] })}
                        options={[
                            { value: "friendly", label: "Friendly — warm and conversational" },
                            { value: "neutral", label: "Neutral — balanced and professional" },
                            { value: "formal", label: "Formal — clinical and precise" },
                        ]}
                    />
                </Field>
                <Field label="Language">
                    <Select
                        value={settings.language}
                        onChange={(v) => update({ language: v })}
                        options={[
                            { value: "English", label: "English" },
                            { value: "Hindi", label: "Hindi" },
                            { value: "Marathi", label: "Marathi" },
                        ]}
                    />
                </Field>
            </Section>

            <div className="border-stone-100 border-t" />

            <Section title="Fallback Response" description="What the AI says when it cannot help with a request.">
                <Field label="Fallback Message" hint="Shown when AI doesn't understand or can't complete a task">
                    <Textarea
                        value={settings.fallbackResponse}
                        onChange={(v) => update({ fallbackResponse: v })}
                        rows={3}
                        placeholder="I'm sorry, I wasn't able to help with that..."
                    />
                </Field>
            </Section>
        </>
    );
}

// ─── Tab: Hours ───────────────────────────────────────────────────────────────

function HoursTab({ settings, update }: TabProps) {
    const updateDay = (dayIndex: string, patch: Partial<ClinicHours>) => {
        update({
            hours: {
                ...settings.hours,
                [dayIndex]: { ...settings.hours[dayIndex], ...patch },
            },
        });
    };

    return (
        <Section title="Clinic Hours" description="The AI uses these hours to answer availability questions. Does not sync to Cal.com yet.">
            <div className="flex flex-col divide-y divide-stone-50">
                {DAYS.map((day, i) => {
                    const h = settings.hours[String(i)] ?? { enabled: false, open: "09:00", close: "19:00" };
                    return (
                        <div key={day} className="flex items-center gap-4 py-3.5">
                            {/* Toggle */}
                            {/* <button
                onClick={() => updateDay(String(i), { enabled: !h.enabled })}
                className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${h.enabled ? "bg-stone-900" : "bg-stone-200"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${h.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
              </button> */}
                            <Switch
                                checked={h.enabled}
                                onCheckedChange={() => updateDay(String(i), { enabled: !h.enabled })}
                            />

                            {/* Day name */}
                            <span className={`w-24 text-sm ${h.enabled ? "text-stone-800 font-medium" : "text-stone-400"}`}>
                                {day}
                            </span>

                            {h.enabled ? (
                                <div className="flex flex-1 items-center gap-2">
                                    <TimeInput value={h.open} onChange={(v) => updateDay(String(i), { open: v })} />
                                    <span className="text-stone-300 text-sm">to</span>
                                    <TimeInput value={h.close} onChange={(v) => updateDay(String(i), { close: v })} />
                                </div>
                            ) : (
                                <span className="text-stone-300 text-xs italic">Closed</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </Section>
    );
}

// ─── Tab: Booking Rules ───────────────────────────────────────────────────────

function BookingTab({ settings, update }: TabProps) {
    return (
        <Section title="Booking Configuration" description="Rules the AI follows when booking appointments.">
            <Field label="Appointment Duration" hint="Default slot length in minutes">
                <Select
                    value={String(settings.appointmentDuration)}
                    onChange={(v) => update({ appointmentDuration: Number(v) })}
                    options={[
                        { value: "15", label: "15 minutes" },
                        { value: "20", label: "20 minutes" },
                        { value: "30", label: "30 minutes" },
                        { value: "45", label: "45 minutes" },
                        { value: "60", label: "1 hour" },
                    ]}
                />
            </Field>
            <Field label="Max Advance Booking" hint="How many days ahead patients can book">
                <Select
                    value={String(settings.maxAdvanceBookingDays)}
                    onChange={(v) => update({ maxAdvanceBookingDays: Number(v) })}
                    options={[
                        { value: "7", label: "7 days (1 week)" },
                        { value: "14", label: "14 days (2 weeks)" },
                        { value: "30", label: "30 days (1 month)" },
                        { value: "60", label: "60 days (2 months)" },
                    ]}
                />
            </Field>

            {/* Preview of system prompt impact */}
            <div className="bg-stone-50 mt-2 p-4 border border-stone-100 rounded-xl">
                <p className="mb-2 text-[11px] text-stone-400 uppercase tracking-wider">AI will be instructed</p>
                <p className="text-stone-600 text-xs leading-relaxed">
                    Book appointments in <strong>{settings.appointmentDuration}-minute</strong> slots, up to{" "}
                    <strong>{settings.maxAdvanceBookingDays} days</strong> in advance. Only suggest slots during
                    clinic hours.
                </p>
            </div>
        </Section>
    );
}

// ─── Tab: Escalation ─────────────────────────────────────────────────────────

function EscalationTab({ settings, update }: TabProps) {
    const addRule = () => {
        update({
            escalationRules: [
                ...settings.escalationRules,
                { id: String(Date.now()), trigger: "", action: "" },
            ],
        });
    };

    const updateRule = (id: string, patch: Partial<EscalationRule>) => {
        update({
            escalationRules: settings.escalationRules.map((r) =>
                r.id === id ? { ...r, ...patch } : r
            ),
        });
    };

    const deleteRule = (id: string) => {
        update({
            escalationRules: settings.escalationRules.filter((r) => r.id !== id),
        });
    };

    return (
        <Section
            title="Escalation Rules"
            description="Define situations where the AI should deviate from normal behavior. Rules are injected directly into the AI's system prompt."
        >
            <div className="flex flex-col gap-4">
                {settings.escalationRules.map((rule, i) => (
                    <div key={rule.id} className="border border-stone-200 rounded-xl overflow-hidden">
                        <div className="flex justify-between items-center bg-stone-50 px-4 py-2.5 border-stone-100 border-b">
                            <span className="font-medium text-stone-500 text-xs uppercase tracking-wider">
                                Rule {i + 1}
                            </span>
                            <button
                                onClick={() => deleteRule(rule.id)}
                                className="hover:bg-red-50 p-1 rounded-lg text-stone-300 hover:text-red-400 transition-colors"
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-3 p-4">
                            <div>
                                <label className="block mb-1.5 text-[11px] text-stone-400 uppercase tracking-wider">
                                    If / Trigger
                                </label>
                                <Textarea
                                    value={rule.trigger}
                                    onChange={(v) => updateRule(rule.id, { trigger: v })}
                                    rows={2}
                                    placeholder="e.g. Patient mentions emergency or chest pain"
                                />
                            </div>
                            <div>
                                <label className="block mb-1.5 text-[11px] text-stone-400 uppercase tracking-wider">
                                    Then / Action
                                </label>
                                <Textarea
                                    value={rule.action}
                                    onChange={(v) => updateRule(rule.id, { action: v })}
                                    rows={2}
                                    placeholder="e.g. Advise calling 112 immediately, do not book appointment"
                                />
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    onClick={addRule}
                    className="flex justify-center items-center gap-2 px-4 py-2.5 border border-stone-200 hover:border-stone-400 border-dashed rounded-xl w-full text-stone-400 hover:text-stone-700 text-sm transition-colors"
                >
                    <Plus size={14} /> Add Rule
                </button>
            </div>
        </Section>
    );
}

// ─── Reusable components ──────────────────────────────────────────────────────

type TabProps = {
    settings: ClinicSettingsData;
    update: (patch: Partial<ClinicSettingsData>) => void;
};

function Section({ title, description, children }: {
    title: string; description?: string; children: React.ReactNode;
}) {
    return (
        <div className="px-6 py-6">
            <div className="mb-6">
                <h3 className="font-semibold text-stone-900 text-sm">{title}</h3>
                {description && <p className="mt-1 text-stone-400 text-xs leading-relaxed">{description}</p>}
            </div>
            <div className="flex flex-col gap-5">{children}</div>
        </div>
    );
}

function Field({ label, hint, children }: {
    label: string; hint?: string; children: React.ReactNode;
}) {
    return (
        <div>
            <label className="block mb-1.5 text-stone-500 text-xs uppercase tracking-wider">{label}</label>
            {children}
            {hint && <p className="mt-1.5 text-[11px] text-stone-400">{hint}</p>}
        </div>
    );
}

function Input({ value, onChange, placeholder }: {
    value: string; onChange: (v: string) => void; placeholder?: string;
}) {
    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="bg-white px-4 py-2.5 border border-stone-200 focus:border-stone-400 rounded-xl focus:outline-none w-full text-stone-700 placeholder:text-stone-300 text-sm transition-colors"
        />
    );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
    value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
    return (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="bg-white px-4 py-2.5 border border-stone-200 focus:border-stone-400 rounded-xl focus:outline-none w-full text-stone-700 placeholder:text-stone-300 text-sm leading-relaxed transition-colors resize-none"
        />
    );
}

function Select({ value, onChange, options }: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
}) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="bg-white px-4 py-2.5 pr-9 border border-stone-200 focus:border-stone-400 rounded-xl focus:outline-none w-full text-stone-700 text-sm transition-colors appearance-none"
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
            <ChevronDown size={14} className="top-1/2 right-3 absolute text-stone-400 -translate-y-1/2 pointer-events-none" />
        </div>
    );
}

function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <input
            type="time"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-white px-3 py-1.5 border border-stone-200 focus:border-stone-400 rounded-lg focus:outline-none text-stone-700 text-sm transition-colors"
        />
    );
}
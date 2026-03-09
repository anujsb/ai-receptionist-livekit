"use client";

import { useEffect, useState, useCallback } from "react";
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  useTrackTranscription,
  useLocalParticipant,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";
import { Mic, Bot, User, Activity, PhoneCall } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
  isFinal: boolean;
}

interface VoiceRoomProps {
  roomName: string;
  username: string;
}

export default function VoiceRoom({ roomName, username }: VoiceRoomProps) {
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  const fetchToken = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/token?room=${encodeURIComponent(roomName)}&username=${encodeURIComponent(username)}`
      );
      const data = await res.json();
      setToken(data.token);
      setConnected(true);
    } catch (err) {
      console.error("Failed to fetch token", err);
    } finally {
      setLoading(false);
    }
  }, [roomName, username]);

  const handleDisconnect = useCallback(() => {
    console.log("disconnected");
  }, []);

  if (!connected || !token) {
    return <LandingScreen onConnect={fetchToken} loading={loading} />;
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      audio={true}
      video={false}
      onError={(error) => console.error("LiveKit error:", error)}
      onDisconnected={(reason) => console.log("Disconnected reason:", reason)}
      className="w-full max-w-3xl"
    >
      <RoomAudioRenderer />
      <AgentInterface onDisconnect={handleDisconnect} />
    </LiveKitRoom>
  );
}

function LandingScreen({ onConnect, loading }: { onConnect: () => void; loading: boolean }) {
  return (
    <div
      className="w-full max-w-3xl"
      style={{ fontFamily: "'Instrument Sans', 'DM Sans', sans-serif" }}
    >
      {/* Header card */}
      <div className="bg-white shadow-sm shadow-stone-100 border border-stone-200/80 rounded-3xl overflow-hidden">
        {/* Top band */}
        <div className="relative bg-stone-900 px-8 py-6 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "100px",
            }}
          />
          <div className="relative flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-emerald-400 rounded-full w-2 h-2 animate-pulse" />
                <span className="text-stone-400 text-xs uppercase tracking-widest">AI Receptionist · Live</span>
              </div>
              <h1 className="font-medium text-white text-2xl tracking-tight" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                Talk to Receptra
              </h1>
            </div>
            <div className="flex justify-center items-center bg-white/10 border border-white/10 rounded-2xl w-12 h-12">
              <Activity size={20} className="text-white/60" />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-8">
          <p className="mb-8 max-w-md text-stone-500 text-sm leading-relaxed">
            This is a live demo of Receptra — your clinic's AI voice receptionist. Try asking to book an appointment, check availability, or ask any clinic-related question.
          </p>

          {/* What you can try */}
          <div className="gap-3 grid grid-cols-3 mb-8">
            {[
              { icon: PhoneCall, label: "Book an appointment", sub: "\"I'd like to see Dr. Sharma tomorrow\"" },
              { icon: Activity, label: "Check availability", sub: "\"What slots are free this week?\"" },
              { icon: Bot, label: "Ask questions", sub: "\"What are your clinic hours?\"" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="bg-stone-50 p-4 border border-stone-100 rounded-2xl">
                <div className="flex justify-center items-center bg-white shadow-sm mb-3 border border-stone-200 rounded-xl w-8 h-8">
                  <Icon size={14} className="text-stone-500" />
                </div>
                <p className="mb-1 font-medium text-stone-700 text-xs">{label}</p>
                <p className="text-[11px] text-stone-400 italic leading-relaxed">{sub}</p>
              </div>
            ))}
          </div>

          <button
            onClick={onConnect}
            disabled={loading}
            className="flex justify-center items-center gap-2.5 bg-stone-900 hover:bg-stone-700 disabled:opacity-50 py-3.5 rounded-xl w-full font-medium text-white text-sm active:scale-[0.99] transition-all disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="border-2 border-white/20 border-t-white rounded-full w-3.5 h-3.5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Mic size={15} />
                Start Conversation
              </>
            )}
          </button>
          <p className="mt-3 text-[11px] text-stone-300 text-center">
            Microphone access required · Powered by OpenAI + LiveKit
          </p>
        </div>
      </div>
    </div>
  );
}

function AgentInterface({ onDisconnect }: { onDisconnect: () => void }) {
  const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();
  const [messages, setMessages] = useState<Message[]>([]);

  const localMicTrack = localParticipant.getTrackPublication(Track.Source.Microphone);
  const { segments: userSegments } = useTrackTranscription(
    localMicTrack
      ? { participant: localParticipant, publication: localMicTrack, source: Track.Source.Microphone }
      : undefined
  );

  useEffect(() => {
    if (!agentTranscriptions?.length) return;
    setMessages((prev) => {
      const updated = [...prev];
      for (const seg of agentTranscriptions) {
        const existingIdx = updated.findIndex((m) => m.id === seg.id);
        const newMsg: Message = {
          id: seg.id,
          role: "assistant",
          text: seg.text,
          timestamp: new Date(),
          isFinal: seg.final,
        };
        if (existingIdx !== -1) updated[existingIdx] = newMsg;
        else updated.push(newMsg);
      }
      return updated;
    });
  }, [agentTranscriptions]);

  useEffect(() => {
    if (!userSegments?.length) return;
    setMessages((prev) => {
      const updated = [...prev];
      for (const seg of userSegments) {
        if (!seg.text.trim()) continue;
        const existingIdx = updated.findIndex((m) => m.id === seg.id);
        const newMsg: Message = {
          id: seg.id,
          role: "user",
          text: seg.text,
          timestamp: new Date(),
          isFinal: seg.final ?? false,
        };
        if (existingIdx !== -1) updated[existingIdx] = newMsg;
        else updated.push(newMsg);
      }
      return updated;
    });
  }, [userSegments]);

  const statusConfig: Record<string, { label: string; dot: string; bg: string }> = {
    listening: { label: "Listening", dot: "bg-emerald-400", bg: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    speaking: { label: "Speaking", dot: "bg-violet-400", bg: "text-violet-600 bg-violet-50 border-violet-100" },
    thinking: { label: "Thinking", dot: "bg-amber-400", bg: "text-amber-600 bg-amber-50 border-amber-100" },
    connecting: { label: "Connecting", dot: "bg-stone-300", bg: "text-stone-500 bg-stone-50 border-stone-200" },
    initializing: { label: "Initializing", dot: "bg-stone-300", bg: "text-stone-500 bg-stone-50 border-stone-200" },
    idle: { label: "Ready", dot: "bg-stone-300", bg: "text-stone-500 bg-stone-50 border-stone-200" },
  };

  const status = statusConfig[state] ?? statusConfig.idle;

  return (
    <div
      className="flex flex-col gap-4 w-full max-w-3xl"
      style={{ fontFamily: "'Instrument Sans', 'DM Sans', sans-serif" }}
    >
      {/* Main card */}
      <div className="bg-white shadow-sm shadow-stone-100 border border-stone-200/80 rounded-3xl overflow-hidden">

        {/* Top bar */}
        <div className="flex justify-between items-center px-6 py-4 border-stone-100 border-b">
          <div className="flex items-center gap-3">
            <div className="flex justify-center items-center bg-stone-900 rounded-xl w-8 h-8">
              <Activity size={14} className="text-white" />
            </div>
            <div>
              <p className="font-medium text-stone-800 text-sm">Receptra</p>
              <p className="text-[11px] text-stone-400">AI Receptionist</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status badge */}
            <span className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${status.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
              {status.label}
            </span>

            <button
              onClick={onDisconnect}
              className="px-3 py-1.5 border border-stone-200 hover:border-stone-400 rounded-lg text-stone-400 hover:text-stone-700 text-xs transition-colors"
            >
              End call
            </button>
          </div>
        </div>

        {/* Visualizer */}
        <div className="bg-stone-50/50 px-6 py-6 border-stone-100 border-b">
          <div className="w-full h-16">
            <BarVisualizer
              state={state}
              trackRef={audioTrack}
              barCount={48}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
          <p className="mt-3 text-[11px] text-stone-400 text-center uppercase tracking-widest">
            {state === "listening" ? "Listening to you" : state === "speaking" ? "Agent is speaking" : "Voice channel active"}
          </p>
        </div>

        {/* Transcript */}
        <div className="px-6 py-5">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[11px] text-stone-400 uppercase tracking-widest">Transcript</p>
            {messages.length > 0 && (
              <span className="text-[11px] text-stone-300">{messages.length} messages</span>
            )}
          </div>

          <div className="flex flex-col gap-3 pr-1 h-64 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col justify-center items-center gap-2 h-full text-stone-300">
                <Mic size={24} strokeWidth={1.5} />
                <p className="text-xs">Say something to get started...</p>
              </div>
            ) : (
              messages.map((msg) => <TranscriptBubble key={msg.id} message={msg} />)
            )}
          </div>
        </div>

        {/* Control bar */}
        <div className="flex justify-center bg-stone-50/30 px-6 py-4 border-stone-100 border-t">
          <VoiceAssistantControlBar />
        </div>
      </div>

      {/* Info strip */}
      <div className="flex justify-between items-center bg-white px-4 py-3 border border-stone-200/80 rounded-2xl">
        <div className="flex items-center gap-2 text-stone-400">
          <div className="bg-emerald-400 rounded-full w-1.5 h-1.5 animate-pulse" />
          <span className="text-xs">Live session active</span>
        </div>
        <span className="text-[11px] text-stone-300">Powered by OpenAI Realtime · LiveKit</span>
      </div>
    </div>
  );
}

function TranscriptBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex justify-center items-center bg-stone-900 mb-0.5 rounded-full w-6 h-6 shrink-0">
          <Bot size={11} className="text-white" />
        </div>
      )}
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed transition-opacity ${
          message.isFinal ? "opacity-100" : "opacity-60"
        } ${
          isUser
            ? "bg-stone-900 text-white rounded-br-sm"
            : "bg-stone-100 text-stone-700 rounded-bl-sm border border-stone-200/60"
        }`}
      >
        <p>{message.text}</p>
        {!message.isFinal && (
          <span className="inline-flex gap-0.5 ml-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="bg-current opacity-50 rounded-full w-1 h-1 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
        )}
      </div>
      {isUser && (
        <div className="flex justify-center items-center bg-stone-100 mb-0.5 border border-stone-200 rounded-full w-6 h-6 shrink-0">
          <User size={11} className="text-stone-500" />
        </div>
      )}
    </div>
  );
}
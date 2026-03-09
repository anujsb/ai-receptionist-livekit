"use client";

import { useState } from "react";
import VoiceRoom from "@/components/VoiceRoom";
import AppLayout from "@/components/layout/AppLayout";

export default function Demo() {
  const [roomName] = useState("voice-room");
  const [username] = useState(`user-${Math.random().toString(36).slice(2, 7)}`);

  return (
    <AppLayout>
      <div className="flex justify-center items-center px-8 py-12 min-h-screen">
        <VoiceRoom roomName={roomName} username={username} />
      </div>
    </AppLayout>
  );
}
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CommunityTabs } from "@/components/community/CommunityTabs";
import { ChannelList } from "@/components/voice/ChannelList";
import { VoiceMessageBoard } from "@/components/voice/VoiceMessageBoard";
import type { VoiceChannel } from "@/lib/voice-channels";

export default function VoicePage() {
  const [activeChannel, setActiveChannel] = useState<VoiceChannel | null>(null);

  return (
    <div className="space-y-4">
      <PageHeader title="Canais de voz" subtitle="Áudios rápidos entre motoristas" />
      <CommunityTabs />
      {activeChannel ? (
        <VoiceMessageBoard channel={activeChannel} onLeave={() => setActiveChannel(null)} />
      ) : (
        <ChannelList onOpen={setActiveChannel} />
      )}
    </div>
  );
}

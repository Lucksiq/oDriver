"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { CommunityTabs } from "@/components/community/CommunityTabs";
import { ChannelList } from "@/components/voice/ChannelList";
import { VoiceChannelBar } from "@/components/voice/VoiceChannelBar";
import { useVoiceStore } from "@/stores/voiceStore";

export default function VoicePage() {
  const joinedChannelId = useVoiceStore((s) => s.joinedChannelId);

  return (
    <div className="space-y-4">
      <PageHeader title="Canais de voz" subtitle="Converse com motoristas ao vivo" />
      <CommunityTabs />
      {joinedChannelId && <VoiceChannelBar />}
      <ChannelList />
    </div>
  );
}

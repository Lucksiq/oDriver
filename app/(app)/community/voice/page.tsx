"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { CommunityTabs } from "@/components/community/CommunityTabs";
import { ChannelList } from "@/components/voice/ChannelList";
import { VoiceChannelBar } from "@/components/voice/VoiceChannelBar";
import { useVoiceRoom } from "@/hooks/useVoiceRoom";

export default function VoicePage() {
  const voice = useVoiceRoom();

  return (
    <div className="space-y-4">
      <PageHeader title="Canais de voz" subtitle="Converse com motoristas ao vivo" />
      <CommunityTabs />
      {voice.channelId && (
        <VoiceChannelBar
          channelId={voice.channelId}
          participants={voice.participants}
          muted={voice.muted}
          onLeave={voice.leave}
          onToggleMute={voice.toggleMute}
          onSetMicEnabled={voice.setMicEnabled}
        />
      )}
      <ChannelList
        joinedChannelId={voice.channelId}
        connecting={voice.connecting}
        onJoin={voice.join}
      />
    </div>
  );
}

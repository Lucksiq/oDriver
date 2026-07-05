export interface VoiceChannel {
  id: string;
  name: string;
  topic?: string;
  city?: string;
  ownerId: string;
  isPrivate: boolean;
  inviteCode: string;
  createdAt: string;
}

export interface VoiceMessage {
  id: string;
  channelId: string;
  authorId: string;
  authorName: string;
  audioData: string;
  mimeType: string;
  durationSeconds?: number;
  createdAt: string;
  expiresAt: string;
}

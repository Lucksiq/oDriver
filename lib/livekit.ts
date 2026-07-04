import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} não está configurada`);
  return value;
}

export async function createVoiceToken(identity: string, name: string, room: string) {
  const at = new AccessToken(requireEnv("LIVEKIT_API_KEY"), requireEnv("LIVEKIT_API_SECRET"), {
    identity,
    name,
  });
  at.addGrant({ roomJoin: true, room, canPublish: true, canSubscribe: true });
  return at.toJwt();
}

export function getVoiceRoomService() {
  const httpUrl = requireEnv("LIVEKIT_URL").replace(/^ws/, "http");
  return new RoomServiceClient(httpUrl, requireEnv("LIVEKIT_API_KEY"), requireEnv("LIVEKIT_API_SECRET"));
}

import { NextResponse } from "next/server";
import { getVoiceRoomService } from "@/lib/livekit";

export async function GET() {
  const svc = getVoiceRoomService();
  const rooms = await svc.listRooms();
  const counts = Object.fromEntries(rooms.map((r) => [r.name, r.numParticipants]));
  return NextResponse.json(counts);
}

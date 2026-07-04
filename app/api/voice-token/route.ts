import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createVoiceToken } from "@/lib/livekit";
import { VOICE_CHANNELS } from "@/lib/voice-channels";

export async function POST(request: Request) {
  const { room } = await request.json();
  if (!VOICE_CHANNELS.some((c) => c.id === room)) {
    return NextResponse.json({ error: "Canal inválido" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const token = await createVoiceToken(user.id, profile?.display_name ?? "Motorista", room);

  return NextResponse.json({ token, url: process.env.LIVEKIT_URL });
}

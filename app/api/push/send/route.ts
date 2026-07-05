import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

webpush.setVapidDetails(
  "mailto:contato@odriver.app",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function POST(request: Request) {
  const { title, body, url } = await request.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", user.id);

  const payload = JSON.stringify({ title, body, url });

  const results = await Promise.allSettled(
    (subscriptions ?? []).map((s) =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload,
      ),
    ),
  );

  const staleEndpoints = (subscriptions ?? [])
    .filter((_, i) => {
      const result = results[i];
      return (
        result.status === "rejected" &&
        [404, 410].includes((result.reason as { statusCode?: number })?.statusCode ?? 0)
      );
    })
    .map((s) => s.endpoint);

  if (staleEndpoints.length > 0) {
    await supabase.from("push_subscriptions").delete().in("endpoint", staleEndpoints);
  }

  return NextResponse.json({ sent: results.filter((r) => r.status === "fulfilled").length });
}

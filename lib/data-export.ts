import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Gathers everything the user owns across every table for LGPD data
 * portability (Art. 18, V). Mirrors the tables already covered by
 * `delete_own_account()`'s cascade, minus data owned by other users
 * (e.g. someone else's reaction to this user's post).
 */
export async function collectUserData(supabase: SupabaseClient<Database>, userId: string) {
  const [
    profile,
    rides,
    expenses,
    extraEarnings,
    goals,
    mapReports,
    mapReportVotes,
    posts,
    postReactions,
    rankingGroupsOwned,
    rankingGroupMemberships,
    voiceChannelsOwned,
    voiceChannelMemberships,
    voiceMessages,
    pushSubscriptions,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("rides").select("*").eq("user_id", userId),
    supabase.from("expenses").select("*").eq("user_id", userId),
    supabase.from("extra_earnings").select("*").eq("user_id", userId),
    supabase.from("goals").select("*").eq("user_id", userId),
    supabase.from("map_reports").select("*").eq("user_id", userId),
    supabase.from("map_report_votes").select("*").eq("user_id", userId),
    supabase.from("posts").select("*").eq("user_id", userId),
    supabase.from("post_reactions").select("*").eq("user_id", userId),
    supabase.from("ranking_groups").select("*").eq("owner_id", userId),
    supabase.from("ranking_group_members").select("*").eq("user_id", userId),
    supabase.from("voice_channels").select("*").eq("owner_id", userId),
    supabase.from("voice_channel_members").select("*").eq("user_id", userId),
    supabase.from("voice_messages").select("*").eq("user_id", userId),
    supabase.from("push_subscriptions").select("*").eq("user_id", userId),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    profile: profile.data,
    rides: rides.data ?? [],
    expenses: expenses.data ?? [],
    extraEarnings: extraEarnings.data ?? [],
    goals: goals.data ?? [],
    mapReports: mapReports.data ?? [],
    mapReportVotes: mapReportVotes.data ?? [],
    posts: posts.data ?? [],
    postReactions: postReactions.data ?? [],
    rankingGroupsOwned: rankingGroupsOwned.data ?? [],
    rankingGroupMemberships: rankingGroupMemberships.data ?? [],
    voiceChannelsOwned: voiceChannelsOwned.data ?? [],
    voiceChannelMemberships: voiceChannelMemberships.data ?? [],
    voiceMessages: voiceMessages.data ?? [],
    pushSubscriptions: pushSubscriptions.data ?? [],
  };
}

/** Triggers a browser download of the given data as a formatted JSON file. */
export function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapPostRow } from "@/lib/supabase/mappers";
import { useAuth } from "@/providers/AuthProvider";
import type { Post, PostType, ReactionKey } from "@/lib/types";

export function useCommunityPosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const instanceId = useId();

  const refresh = useCallback(async () => {
    const [postsRes, myReactionsRes] = await Promise.all([
      supabase
        .from("posts")
        // Disambiguate: post_reactions also links posts<->profiles (many-to-many),
        // so PostgREST can't infer which relationship to embed without a hint.
        .select("*, profiles!posts_user_id_fkey(display_name)")
        .order("created_at", { ascending: false }),
      user
        ? supabase.from("post_reactions").select("post_id, reaction").eq("user_id", user.id)
        : Promise.resolve({ data: [] }),
    ]);
    const myReactions = new Map(
      (myReactionsRes.data ?? []).map((r) => [r.post_id, r.reaction as ReactionKey]),
    );
    setPosts(
      (postsRes.data ?? []).map((row) => mapPostRow(row, myReactions.get(row.id))),
    );
    setLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    // Fetch-on-mount; see useRides.ts for why this needs the disable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  useEffect(() => {
    const channel = supabase
      .channel(`posts_changes_${instanceId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, refresh, instanceId]);

  async function addPost(input: { content: string; type: PostType; city: string }) {
    if (!user) return;
    await supabase.from("posts").insert({
      user_id: user.id,
      content: input.content,
      type: input.type,
      city: input.city,
    });
    await refresh();
  }

  async function react(postId: string, reaction: ReactionKey) {
    await supabase.rpc("react_to_post", { p_post_id: postId, p_reaction: reaction });
    await refresh();
  }

  return { posts, loading, addPost, react };
}

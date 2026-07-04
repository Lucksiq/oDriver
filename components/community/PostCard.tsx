"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Post, PostType, ReactionKey } from "@/lib/types";

const TYPE_META: Record<PostType, { label: string; className: string }> = {
  tip: { label: "Dica", className: "bg-success text-success-foreground" },
  alert: { label: "Alerta", className: "bg-destructive text-white" },
  achievement: { label: "Conquista", className: "bg-warning text-warning-foreground" },
  question: { label: "Pergunta", className: "bg-chart-4 text-white" },
  general: { label: "Geral", className: "bg-secondary text-secondary-foreground" },
};

const REACTIONS: { key: ReactionKey; emoji: string }[] = [
  { key: "useful", emoji: "👍" },
  { key: "alert", emoji: "⚠️" },
  { key: "hot", emoji: "🔥" },
];

export function PostCard({
  post,
  onReact,
}: {
  post: Post;
  onReact: (postId: string, reaction: ReactionKey) => void;
}) {
  const meta = TYPE_META[post.type];

  return (
    <Card>
      <CardContent className="space-y-2 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{post.authorName}</span>
            <Badge className={meta.className}>{meta.label}</Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
            })}
          </span>
        </div>
        <p className="text-sm">{post.content}</p>
        <div className="flex gap-2 pt-1">
          {REACTIONS.map((r) => (
            <button
              key={r.key}
              onClick={() => onReact(post.id, r.key)}
              className={`flex items-center gap-1 rounded-full border px-2 py-1 text-xs transition-colors ${
                post.myReaction === r.key
                  ? "border-primary bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {r.emoji} {post.reactions[r.key]}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

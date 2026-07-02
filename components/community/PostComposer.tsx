"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useCommunityStore } from "@/stores/communityStore";
import { useCurrentProfile } from "@/stores/authStore";
import type { PostType } from "@/lib/types";

const TYPE_LABELS: Record<PostType, string> = {
  tip: "Dica",
  alert: "Alerta",
  achievement: "Conquista",
  question: "Pergunta",
  general: "Geral",
};

export function PostComposer() {
  const profile = useCurrentProfile();
  const addPost = useCommunityStore((s) => s.addPost);
  const [content, setContent] = useState("");
  const [type, setType] = useState<PostType>("general");

  function submit() {
    if (!content.trim()) {
      toast.error("Escreva algo antes de publicar");
      return;
    }
    if (content.length > 280) {
      toast.error("Máximo de 280 caracteres");
      return;
    }
    addPost({
      content,
      type,
      authorName: profile?.displayName ?? "Motorista",
      city: profile?.city ?? "",
    });
    setContent("");
    toast.success("Publicado na comunidade");
  }

  return (
    <Card>
      <CardContent className="space-y-2 p-3">
        <Textarea
          placeholder="Compartilhe uma dica, alerta ou conquista..."
          value={content}
          maxLength={280}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <Select
            items={TYPE_LABELS}
            value={type}
            onValueChange={(v) => setType(v as PostType)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="flex-1 text-right text-xs text-muted-foreground">
            {content.length}/280
          </span>
          <Button onClick={submit}>Publicar</Button>
        </div>
      </CardContent>
    </Card>
  );
}

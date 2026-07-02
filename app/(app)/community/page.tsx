"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { CommunityTabs } from "@/components/community/CommunityTabs";
import { PostComposer } from "@/components/community/PostComposer";
import { PostCard } from "@/components/community/PostCard";
import { useCommunityStore } from "@/stores/communityStore";

export default function CommunityFeedPage() {
  const posts = [...useCommunityStore((s) => s.posts)].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  return (
    <div className="space-y-4">
      <PageHeader title="Comunidade" subtitle="Feed de motoristas da sua cidade" />
      <CommunityTabs />
      <PostComposer />
      <div className="space-y-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { CommunityTabs } from "@/components/community/CommunityTabs";
import { PostComposer } from "@/components/community/PostComposer";
import { PostCard } from "@/components/community/PostCard";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";

export default function CommunityFeedPage() {
  const { posts, addPost, react } = useCommunityPosts();

  return (
    <div className="space-y-4">
      <PageHeader title="Comunidade" subtitle="Feed de motoristas da sua cidade" />
      <CommunityTabs />
      <PostComposer onSubmit={addPost} />
      <div className="space-y-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onReact={react} />
        ))}
      </div>
    </div>
  );
}

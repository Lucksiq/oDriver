import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/lib/id";
import { safeStorage } from "@/lib/persist";
import { seedPosts } from "@/lib/mock-seed";
import type { Post, PostType, ReactionKey } from "@/lib/types";

interface CommunityState {
  hydrated: boolean;
  posts: Post[];
  setHydrated: (v: boolean) => void;
  addPost: (input: {
    content: string;
    type: PostType;
    authorName: string;
    city: string;
  }) => void;
  react: (postId: string, reaction: ReactionKey) => void;
}

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set) => ({
      hydrated: false,
      posts: seedPosts,
      setHydrated: (v) => set({ hydrated: v }),
      addPost: (input) =>
        set((s) => ({
          posts: [
            {
              id: uid(),
              content: input.content,
              type: input.type,
              authorName: input.authorName,
              authorCity: input.city,
              city: input.city,
              reactions: { useful: 0, alert: 0, hot: 0 },
              createdAt: new Date().toISOString(),
            },
            ...s.posts,
          ],
        })),
      react: (postId, reaction) =>
        set((s) => ({
          posts: s.posts.map((p) => {
            if (p.id !== postId) return p;
            const alreadyReacted = p.myReaction === reaction;
            const reactions = { ...p.reactions };
            if (p.myReaction) {
              reactions[p.myReaction] = Math.max(0, reactions[p.myReaction] - 1);
            }
            if (!alreadyReacted) {
              reactions[reaction] = reactions[reaction] + 1;
            }
            return {
              ...p,
              reactions,
              myReaction: alreadyReacted ? undefined : reaction,
            };
          }),
        })),
    }),
    {
      name: "odriver-community",
      storage: safeStorage<CommunityState>(),
      skipHydration: true,
      partialize: (s) => ({ posts: s.posts }) as CommunityState,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

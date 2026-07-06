import type { Profile } from "@/lib/types";

/** Whether the current user can moderate (delete/remove) a resource — its creator, or any admin. */
export function canModerate(
  profile: Pick<Profile, "isAdmin"> | null,
  ownerId: string | undefined,
  userId: string | undefined,
) {
  return profile?.isAdmin === true || (!!ownerId && ownerId === userId);
}

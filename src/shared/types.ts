type UserProfile = {
  slackid: string; // main profile id!
  name: string;
  email: string;
  avatar: string;
};

type Result<T> = { ok: true; value: T } | { ok: false; error: Error };

export type { UserProfile, Result };

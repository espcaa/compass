type Result<T> = { ok: true; value: T } | { ok: false; error: Error };

export type { Result };

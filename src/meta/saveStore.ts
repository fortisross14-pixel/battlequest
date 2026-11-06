import { migrateProfile, type Profile } from './profile';

/**
 * Persistence behind an interface (GAME_DESIGN 11), so Capacitor Preferences or IndexedDB
 * can replace localStorage later.
 */
export interface SaveStore {
  load(): Profile | null;
  save(p: Profile): void;
  clear(): void;
}

/** The key keeps its v1 name so existing saves are found; the profile carries its own version. */
const KEY = 'battlequest.profile.v1';
/** A save that can't be read is copied here before a new profile replaces it. */
const BACKUP_KEY = 'battlequest.profile.unreadable';

export class LocalSaveStore implements SaveStore {
  load(): Profile | null {
    let raw: string | null | undefined;
    try {
      raw = globalThis.localStorage?.getItem(KEY);
      if (!raw) return null;
      const p = migrateProfile(JSON.parse(raw));
      if (!p) globalThis.localStorage?.setItem(BACKUP_KEY, raw);
      return p;
    } catch {
      try {
        if (raw) globalThis.localStorage?.setItem(BACKUP_KEY, raw);
      } catch {
        // ignore
      }
      return null;
    }
  }

  save(p: Profile): void {
    try {
      globalThis.localStorage?.setItem(KEY, JSON.stringify(p));
    } catch {
      // Private mode or storage full: the game keeps running without saving.
    }
  }

  clear(): void {
    try {
      globalThis.localStorage?.removeItem(KEY);
    } catch {
      // ignore
    }
  }
}

export class MemorySaveStore implements SaveStore {
  private data: string | null = null;
  load(): Profile | null {
    return this.data ? migrateProfile(JSON.parse(this.data)) : null;
  }
  save(p: Profile): void {
    this.data = JSON.stringify(p);
  }
  /** Stores raw JSON as if an older version of the game had saved it (tests). */
  saveRaw(json: string): void {
    this.data = json;
  }
  clear(): void {
    this.data = null;
  }
}

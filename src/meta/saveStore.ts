import { newProfile, type Profile } from './profile';

/**
 * Persistence behind an interface (GAME_DESIGN 11), so Capacitor Preferences or IndexedDB
 * can replace localStorage later.
 */
export interface SaveStore {
  load(): Profile | null;
  save(p: Profile): void;
  clear(): void;
}

const KEY = 'battlequest.profile.v1';

export class LocalSaveStore implements SaveStore {
  load(): Profile | null {
    try {
      const raw = globalThis.localStorage?.getItem(KEY);
      if (!raw) return null;
      const p = JSON.parse(raw) as Profile;
      return p.version === 1 ? { ...newProfile(), ...p } : null;
    } catch {
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
    return this.data ? (JSON.parse(this.data) as Profile) : null;
  }
  save(p: Profile): void {
    this.data = JSON.stringify(p);
  }
  clear(): void {
    this.data = null;
  }
}

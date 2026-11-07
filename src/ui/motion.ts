import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { Flip } from 'gsap/Flip';
import { SplitText } from 'gsap/SplitText';

/**
 * The motion system (motion skill, UX_PRESENTATION §3). Every duration and easing used by
 * the HTML screens and the Pixi board comes from here. GSAP drives all of it; the Pixi
 * ticker only renders. Animations never change game state, and every one can be skipped.
 */

gsap.registerPlugin(CustomEase, DrawSVGPlugin, Flip, SplitText);

/** Durations in ms (motion skill token table). */
export const MOTION = {
  instant: 80,
  quick: 160,
  /** One square of a unit's slide; scales with path length, at most `moveMax`. */
  move: 240,
  moveMax: 600,
  impact: 320,
  reveal: 450,
  /** Command bubble bloom; usable within `bubbleUsable`, closes in `bubbleClose`. */
  bubble: 500,
  bubbleUsable: 120,
  bubbleClose: 250,
  ceremony: 2400,
  /** Reduce motion replaces movement with fades of at most this. */
  reducedFade: 160,
  /** The hit-stop on a charge's impact frame (game-feel). */
  hitStop: 60,
} as const;

/** The token curves (motion skill), as named GSAP eases. */
CustomEase.create('bq.out', '0.2,0.8,0.2,1');
CustomEase.create('bq.in', '0.6,0,0.8,0.2');
CustomEase.create('bq.inOut', '0.65,0,0.35,1');
export const EASE = {
  out: 'bq.out',
  in: 'bq.in',
  inOut: 'bq.inOut',
  back: 'back.out(1.6)',
  /** A damped settle for cards and turning blocks. */
  spring: 'elastic.out(1, 0.55)',
} as const;

/** Seconds for a token (GSAP works in seconds). */
export const sec = (ms: number) => ms / 1000;

// ---------- Settings ----------

export interface MotionSettings {
  /** The in-game Reduce motion toggle (the OS setting also applies). */
  reduceMotion: boolean;
  /** Animation speed: 1 = normal, 2 = fast. */
  speed: number;
  haptics: boolean;
  /** Confirm moves and attacks with one tap instead of two. */
  quickConfirm: boolean;
}

const KEY = 'battlequest.settings.v1';
const settings: MotionSettings = {
  reduceMotion: false,
  speed: 1,
  haptics: true,
  quickConfirm: false,
};
try {
  Object.assign(settings, JSON.parse(globalThis.localStorage?.getItem(KEY) ?? '{}'));
} catch {
  // Private mode or blocked storage: defaults.
}

let osReduced = false;
// The OS setting, through GSAP's matchMedia (only in a browser; tests run in Node).
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  gsap.matchMedia().add(
    {
      reduce: '(prefers-reduced-motion: reduce)',
      full: '(prefers-reduced-motion: no-preference)',
    },
    (ctx) => {
      osReduced = !!ctx.conditions?.reduce;
    },
  );
}

export function motionSettings(): Readonly<MotionSettings> {
  return settings;
}

export function setMotionSettings(next: Partial<MotionSettings>): void {
  Object.assign(settings, next);
  gsap.globalTimeline.timeScale(settings.speed);
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Not saved this session.
  }
}
gsap.globalTimeline.timeScale(settings.speed);

/** True when movement must become short fades (OS setting or the in-game toggle). */
export function reducedMotion(): boolean {
  return settings.reduceMotion || osReduced;
}

// ---------- Skipping ----------

const running = new Set<gsap.core.Animation>();

/**
 * Registers an animation that input may fast-forward. Returns it, so call sites stay short.
 * It leaves the set when it completes.
 */
export function track<T extends gsap.core.Animation>(anim: T): T {
  running.add(anim);
  // Keeps the animation's own onComplete (cleanup such as removing a speck or a banner).
  const own = anim.eventCallback('onComplete') as (() => void) | null | undefined;
  anim.eventCallback('onComplete', () => {
    running.delete(anim);
    if (typeof own === 'function') own();
  });
  return anim;
}

/** Jumps every tracked animation to its end (a tap never waits for decoration). */
export function fastForward(): void {
  // Callbacks met on the way can start new tracked animations (ink specks, a card deal):
  // finish those too, so nothing is left moving after a skip.
  for (let pass = 0; pass < 5 && running.size; pass++) {
    for (const a of [...running]) {
      a.progress(1);
      running.delete(a);
    }
  }
}

export function isAnimating(): boolean {
  return running.size > 0;
}

/** Waits for a GSAP animation to finish (or be fast-forwarded). */
export function done(anim: gsap.core.Animation): Promise<void> {
  return new Promise((resolve) => {
    // Already finished, or nothing to play (an empty timeline completes before we listen).
    if (anim.progress() >= 1 || anim.totalDuration() === 0) {
      running.delete(anim);
      return resolve();
    }
    const prev = anim.eventCallback('onComplete');
    anim.eventCallback('onComplete', () => {
      running.delete(anim);
      if (typeof prev === 'function') prev();
      resolve();
    });
  });
}

// ---------- Sound and haptics (stubs) ----------

export type SfxCue =
  | 'select'
  | 'bubble-open'
  | 'bubble-close'
  | 'move'
  | 'charge'
  | 'impact'
  | 'volley'
  | 'fortify'
  | 'breakthrough'
  | 'rout'
  | 'turn'
  | 'seal-break'
  | 'card-flip'
  | 'coin'
  | 'coins'
  | 'stamp'
  | 'unlock'
  | 'quill'
  | 'reveal'
  | 'reveal-legendary'
  | 'victory'
  | 'defeat';

/** No-op sound hook: every recipe names its cue, so audio can be added later. */
export function sfx(_cue: SfxCue): void {
  // Audio comes later (UX §7).
}

/** Light / medium / success feedback where the device supports vibration. */
export function haptic(kind: 'light' | 'medium' | 'success' | 'warning'): void {
  if (!settings.haptics) return;
  const ms = { light: 8, medium: 16, success: [10, 40, 18], warning: [20, 30, 20] }[kind];
  try {
    globalThis.navigator?.vibrate?.(ms);
  } catch {
    // Unsupported.
  }
}

export { gsap, Flip, SplitText, CustomEase, DrawSVGPlugin };

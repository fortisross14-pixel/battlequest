/** Touch-first gestures on Pointer Events, so touch, pen and mouse share one code path. */
export interface GestureHandlers {
  tap(x: number, y: number): void;
  longPress(x: number, y: number): void;
  pan(dx: number, dy: number): void;
  pinch(factor: number, cx: number, cy: number): void;
}

const TAP_SLOP = 10; // px a finger may wander and still count as a tap
const LONG_PRESS_MS = 500;

interface Track {
  x: number;
  y: number;
  startX: number;
  startY: number;
  startT: number;
}

export function attachGestures(el: HTMLElement, h: GestureHandlers): () => void {
  const pointers = new Map<number, Track>();
  let panning = false;
  let pinching = false;
  let longFired = false;
  let longTimer: number | undefined;
  let lastPinchDist = 0;

  const local = (e: PointerEvent | WheelEvent) => {
    const r = el.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const cancelLong = () => {
    if (longTimer !== undefined) window.clearTimeout(longTimer);
    longTimer = undefined;
  };
  const pinchInfo = () => {
    const [a, b] = [...pointers.values()];
    return {
      dist: Math.hypot(a!.x - b!.x, a!.y - b!.y),
      cx: (a!.x + b!.x) / 2,
      cy: (a!.y + b!.y) / 2,
    };
  };

  const down = (e: PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    el.setPointerCapture(e.pointerId);
    const p = local(e);
    pointers.set(e.pointerId, { x: p.x, y: p.y, startX: p.x, startY: p.y, startT: e.timeStamp });
    if (pointers.size === 1) {
      panning = false;
      pinching = false;
      longFired = false;
      longTimer = window.setTimeout(() => {
        longFired = true;
        h.longPress(p.x, p.y);
      }, LONG_PRESS_MS);
    } else if (pointers.size === 2) {
      cancelLong();
      pinching = true;
      lastPinchDist = pinchInfo().dist;
    }
  };

  const move = (e: PointerEvent) => {
    const t = pointers.get(e.pointerId);
    if (!t) return;
    const p = local(e);
    const dx = p.x - t.x;
    const dy = p.y - t.y;
    t.x = p.x;
    t.y = p.y;
    if (pointers.size >= 2) {
      const info = pinchInfo();
      if (lastPinchDist > 0) h.pinch(info.dist / lastPinchDist, info.cx, info.cy);
      lastPinchDist = info.dist;
      return;
    }
    if (!panning && Math.hypot(p.x - t.startX, p.y - t.startY) > TAP_SLOP) {
      panning = true;
      cancelLong();
    }
    if (panning && !pinching) h.pan(dx, dy);
  };

  const up = (e: PointerEvent) => {
    const t = pointers.get(e.pointerId);
    if (!t) return;
    pointers.delete(e.pointerId);
    if (pointers.size === 0) {
      cancelLong();
      if (!panning && !pinching && !longFired) {
        // A busy main thread can deliver pointerup before the timer: judge by the hold time too.
        if (e.timeStamp - t.startT >= LONG_PRESS_MS) h.longPress(t.x, t.y);
        else h.tap(t.x, t.y);
      }
      panning = false;
      pinching = false;
    } else if (pointers.size === 1) {
      lastPinchDist = 0;
    }
  };

  const cancel = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    cancelLong();
    if (pointers.size === 0) {
      panning = false;
      pinching = false;
    }
  };

  const wheel = (e: WheelEvent) => {
    e.preventDefault();
    const p = local(e);
    h.pinch(Math.exp(-e.deltaY * 0.0015), p.x, p.y);
  };

  const noMenu = (e: Event) => e.preventDefault();

  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', cancel);
  el.addEventListener('wheel', wheel, { passive: false });
  el.addEventListener('contextmenu', noMenu);
  return () => {
    el.removeEventListener('pointerdown', down);
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointercancel', cancel);
    el.removeEventListener('wheel', wheel);
    el.removeEventListener('contextmenu', noMenu);
  };
}

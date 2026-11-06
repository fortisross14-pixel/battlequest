---
name: touch-controls
description: Standards and patterns for BattleQuest's "elite" touch controls (drag-to-move, facing by drag, camera feel, feedback, undo, quick actions) and how to test gestures. Use when changing src/ui/input.ts, src/ui/controller.ts, camera code, or anything the player taps or drags.
---

# Touch controls

Aim: the controls feel **fast, precise and forgiving**, like an instrument. Beginners can tap step by step; experienced players can chain gestures without waiting for the game.

## Principles

1. **Two ways to do everything.** Tap-tap stays (the beginner path, two-tap confirm) and a direct drag gesture is added (the expert path). Both send the same core commands.
2. **Immediate feedback.** Show a visual response within 1 frame of a pointer down (press highlight) and a preview within 50 ms of a drag. Never block input during animations (see the `motion` skill).
3. **Forgiving.**
   - Touch targets: at least 44 pt for buttons; a whole square for units, plus a hit slop of 6–8 px.
   - Snap drags to the nearest legal square.
   - A drag released on an illegal square cancels cleanly and explains why.
   - Undo is always one tap away and is multi-level for moves and rotations.
4. **No hidden state.** Whatever a gesture is about to do is drawn before the finger lifts: the path, MP used, final facing, the charge or shoot target, and preview odds.

## The control set to support

- **Drag to move:** press a unit and drag. A path ghost follows, snapped to reachable squares. The colour changes on a square from which a charge is possible. Release = the move preview (confirm with a tap, or with release if "Quick confirm" is on in the settings).
- **Drag to face:** after a move, or on a selected unit, drag outward from the unit. The block rotates live in 45° snaps and shows the MP cost; release sets the facing.
- **Drag onto an enemy:** shows the charge or shoot preview with odds; release opens the confirm panel. In Quick confirm mode, release executes, with a 2 s undo toast for moves only, since combat can't be undone.
- **Double-tap a unit:** selects it and centres the camera on it.
- **Long press:** opens the unit card (it already exists). Show a growing radial ring during the hold so the player sees it coming.
- **Swipe the action bar:** cycles to the next and previous unit that still has actions.
- **Camera:**
  - pan with inertia (friction about 0.92 per frame) and soft edges (rubber-band at the map bounds);
  - pinch zoom around the finger midpoint, with zoom limits;
  - a two-finger double-tap fits the map to the screen;
  - the camera never jumps: always ease it.
- **End turn:** units that haven't acted get a pulse, and the End turn button asks "2 units haven't acted — End turn?" Hold the button for 600 ms to skip the question.
- **Haptics:** a `haptic('light'|'medium'|'success'|'warning')` helper. Use `navigator.vibrate` where it exists, and leave a Capacitor Haptics stub for later. Light on snap, medium on charge confirm, success on victory. It can be turned off in settings.
- **Desktop extras:** the mouse wheel zooms, right-drag pans, and keyboard shortcuts (Space = end turn, Z = undo, Tab = next unit, Esc = cancel). They are optional and must never be required.

## Architecture

- Gesture recognition stays in `input.ts` and produces semantic gestures (`tap`, `doubleTap`, `longPress`, `dragStart/Move/End`, `pinch`, `pan`). It knows nothing about game rules.
- Move the controller's mode logic into a **plain state machine** (idle → selected → dragging-path → previewing-move → facing → previewing-attack). It is unit-testable with no DOM. Every transition is a pure function of (mode, gesture, state) → (mode, commands, view hints).
- Snap and legality checks come from core (`planMove`, `previewCombat`). Never re-implement the rules in the UI.

## Testing

- Unit-test the state machine for every transition, cancel path and illegal-drop path.
- Playwright gesture tests at 1024×768 and 812×375 using Pointer Events: drag-to-move, drag-to-face, drag onto an enemy, pinch, long press, and taps during an animation (they must not be lost or doubled).
- Measure input latency with a performance mark from pointerdown to the first highlight frame; the target is under 16 ms.
- Run `visual-check` and `motion-check` after control changes.

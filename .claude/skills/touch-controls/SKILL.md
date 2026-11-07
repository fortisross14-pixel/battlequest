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

**The spec is `docs/UX_PRESENTATION.md` §1–2 and §6.** In short:

- **Command bubble:** tapping your unit blooms petals around it at fixed clock positions (Info 12, Turn 3, Hold 6, Skill 9, Undo 10:30). Petals rotate as a group to stay on screen and never sit under a HUD rectangle.
- **Move is the default:** with a unit selected, tap any reachable square to see the ghost, then tap again or double-tap to confirm. Tap an enemy for the attack preview. Tap another of your units to switch. Tap unreachable ground to deselect.
- **Turn mode:** 8 arrowheads around the unit; tap one, or drag around the unit (45° snaps, live MP cost).
- **Optional expert drag** (a setting, default on): press a unit and drag to a square to get the same ghost, then release and tap to confirm.
- **Long press:** opens the unit card directly, with a growing ring during the hold.
- **The "waiting" chip** next to End turn cycles through units that haven't acted. There is no bottom action bar.
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
- Move the controller's mode logic into a **plain state machine** (idle → selected (bubble open) → previewing-move (ghost) → facing → previewing-attack, plus info-open). It is unit-testable with no DOM. Every transition is a pure function of (mode, gesture, state) → (mode, commands, view hints).
- Snap and legality checks come from core (`planMove`, `previewCombat`). Never re-implement the rules in the UI.

## Testing

- Unit-test the state machine for every transition, cancel path and illegal-drop path.
- Playwright gesture tests at 1024×768 and 812×375 using Pointer Events: drag-to-move, drag-to-face, drag onto an enemy, pinch, long press, and taps during an animation (they must not be lost or doubled).
- Measure input latency with a performance mark from pointerdown to the first highlight frame; the target is under 16 ms.
- Run `visual-check` and `motion-check` after control changes.

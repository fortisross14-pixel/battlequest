import { el } from './hud';
import { motionSettings, setMotionSettings } from './motion';

/**
 * The battle controls (UX_PRESENTATION §2, touch-controls skill). How to play is generated
 * from this list, so the help page and the controls never drift apart.
 */
export const CONTROLS: { gesture: string; does: string }[] = [
  { gesture: 'Tap your unit', does: 'Select it: the command bubble opens around it.' },
  {
    gesture: 'Tap a blue square',
    does: 'Preview the move (footprints and MP cost). Tap it again, or double-tap, to move.',
  },
  {
    gesture: 'Tap an enemy',
    does: 'Preview the attack. Tap Confirm (or the enemy again) to attack.',
  },
  { gesture: 'Tap another of your units', does: 'Switch the selection.' },
  { gesture: 'Tap ground you can’t reach', does: 'Deselect.' },
  { gesture: 'ⓘ petal, or long-press a unit', does: 'Open the unit card.' },
  {
    gesture: '➚ petal (Move / Attack)',
    does: 'Close the bubble to reach nearby squares; the unit stays selected.',
  },
  { gesture: '↻ petal', does: 'Turn mode: tap an arrowhead to face that way (each shows its MP).' },
  { gesture: '⛨ petal', does: 'Hold: brace and end the unit’s action.' },
  { gesture: '★ petal or the general medallion', does: 'Use your general’s skill.' },
  { gesture: '↶ petal or “Moved · Undo”', does: 'Undo the last move.' },
  { gesture: '“N waiting”', does: 'Jump to the next unit that hasn’t acted.' },
  { gesture: 'Drag / pinch', does: 'Pan / zoom the map.' },
  { gesture: 'Long-press empty ground', does: 'Read what the terrain does.' },
  { gesture: 'Tap during an animation', does: 'Skip it to the end.' },
  {
    gesture: 'Keyboard',
    does: 'Esc cancel · Enter confirm · E end turn · U undo · N next unit · T turn · H hold · I info · G general.',
  },
];

export function howToPlay(): HTMLElement {
  return el(
    'dl',
    { class: 'controls' },
    ...CONTROLS.flatMap((c) => [el('dt', {}, c.gesture), el('dd', {}, c.does)]),
  );
}

/** The battle menu's Settings page (UX §6). Changes apply at once. */
export function settingsPage(): HTMLElement {
  const s = motionSettings();
  const toggle = (label: string, on: boolean, set: (v: boolean) => void) => {
    const b = el(
      'button',
      {
        class: `toggle ${on ? 'on' : ''}`,
        type: 'button',
        role: 'switch',
        'aria-checked': String(on),
      },
      el('span', {}, label),
      el('b', {}, on ? 'On' : 'Off'),
    );
    b.onclick = () => {
      const v = b.getAttribute('aria-checked') !== 'true';
      set(v);
      b.setAttribute('aria-checked', String(v));
      b.classList.toggle('on', v);
      b.querySelector('b')!.textContent = v ? 'On' : 'Off';
    };
    return b;
  };
  const speed = el('div', {
    class: 'segmented',
    role: 'radiogroup',
    'aria-label': 'Animation speed',
  });
  for (const v of [1, 1.5, 2]) {
    const b = el(
      'button',
      { class: `seg ${s.speed === v ? 'on' : ''}`, type: 'button', role: 'radio' },
      `${v}×`,
    );
    b.setAttribute('aria-checked', String(s.speed === v));
    b.onclick = () => {
      setMotionSettings({ speed: v });
      for (const c of speed.children) {
        c.classList.toggle('on', c === b);
        c.setAttribute('aria-checked', String(c === b));
      }
    };
    speed.append(b);
  }
  const sound = el(
    'button',
    { class: 'toggle', type: 'button', disabled: '' },
    el('span', {}, 'Sound'),
    el('b', {}, 'Later'),
  );
  return el(
    'div',
    { class: 'settings' },
    el('div', { class: 'setting' }, el('span', {}, 'Animation speed'), speed),
    toggle('Reduce motion', s.reduceMotion, (v) => setMotionSettings({ reduceMotion: v })),
    toggle('Haptics', s.haptics, (v) => setMotionSettings({ haptics: v })),
    toggle('Quick confirm (one tap moves and attacks)', s.quickConfirm, (v) =>
      setMotionSettings({ quickConfirm: v }),
    ),
    sound,
  );
}

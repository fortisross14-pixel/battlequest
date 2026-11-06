/** Guided steps for the Prologue (Megiddo). `until` is what the player has to do next. */
export const MEGIDDO_TUTORIAL: {
  text: string;
  until: 'select' | 'move' | 'facing' | 'charge' | 'endTurn' | 'never';
}[] = [
  {
    text: 'Tap your chariots (the block with the wheel and the pennant) to select them.',
    until: 'select',
  },
  {
    text: 'Blue squares show where a unit can go. Tap one to see a ghost of the move, then tap it again to confirm.',
    until: 'move',
  },
  {
    text: 'Pick a facing on the ring, or tap elsewhere to keep the current one. The thick edge of a block is its front.',
    until: 'facing',
  },
  {
    text: 'A red frame marks an enemy you can charge. Charging a flank (side) or rear hits much harder. Tap it to see the preview, then confirm.',
    until: 'charge',
  },
  {
    text: 'Press End turn. Melee is fought at the end of every turn, then the enemy moves.',
    until: 'endTurn',
  },
  {
    text: 'Break the enemy: when units worth half their army have routed or died, the army flees. Long-press any unit to read its card.',
    until: 'never',
  },
];

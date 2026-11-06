import type { TutorialStep } from './types';

/**
 * Tutorial scripts for Age 0 (GAME_DESIGN 7.4). Each step waits for a real game event
 * (`until`); the last step stays up as a reminder. Scripts are data: one per battle.
 */

/** Megiddo: select, move, face; flank beats front; support; how armies break. */
export const MEGIDDO_TUTORIAL: TutorialStep[] = [
  {
    text: 'Tap your chariots (the round badge with the wheel) to select them. Thutmose stands behind your line with his banner: keep him safe — if your general falls, the battle is lost.',
    until: 'select',
  },
  {
    text: 'Blue squares show where a unit can go. Tap one to see a ghost of the move, then tap it again to confirm. Swing round the end of the Canaanite line.',
    until: 'move',
  },
  {
    text: 'Pick a facing on the ring (any turn costs 1 MP), or tap elsewhere to keep it. The thick edge of a block is its front. Later, ↻ Turn turns a selected unit.',
    until: 'facing',
  },
  {
    text: 'Charge the side of the Canaanite line: tap a red-framed enemy. The preview shows "Flank ×1.5" and that it only strikes back at half — a frontal charge shows neither. Confirm.',
    until: 'flankCharge',
  },
  {
    text: 'Support: send your spearmen into the same enemy. Two units on one enemy break it fast.',
    until: 'support',
  },
  {
    text: 'Press End turn. Melee is fought at the end of every turn, then the enemy moves.',
    until: 'endTurn',
  },
  {
    text: 'An army breaks when units worth half of it have routed or died — or when its general falls. Long-press any unit to read its card.',
    until: 'never',
  },
];

/** Kadesh (in battle): shooting with archers and using a general skill. */
export const KADESH_TUTORIAL: TutorialStep[] = [
  {
    text: 'Hittite chariots are crossing the Orontes. Tap your archers: the dotted squares show where they can shoot.',
    until: 'select',
  },
  {
    text: 'Archers hit up to three squares away, even over other units. Tap a red unit inside the dotted area and confirm the shot.',
    until: 'shoot',
  },
  {
    text: 'Your general has a skill. Press ★ General and use it while the enemy closes in.',
    until: 'skill',
  },
  {
    text: 'End your turn. Spearmen facing the river stop chariots cold, and chariots in a ford fight badly.',
    until: 'endTurn',
  },
  {
    text: 'Hold the camp until the end of turn 5: keep shooting, and keep your spearmen facing the fords.',
    until: 'never',
  },
];

/** Kadesh (army builder): choosing troops and a general. */
export const KADESH_BUILDER_TIPS = [
  'Choose your troops: tap a slot to fill it. You may take several copies of one troop — try 2 Egyptian archers to shoot the chariots as they cross.',
  'Pick a general below. Long-press a general card to read their skill: you will use it in battle.',
];

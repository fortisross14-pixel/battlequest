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
    unit: 'bronzeAgeChariots',
  },
  {
    text: 'Blue squares show where a unit can go. Tap one to see a ghost of the move, then tap it again to confirm. Swing north, round the open end of the Canaanite line.',
    until: 'move',
    unit: 'bronzeAgeChariots',
  },
  {
    text: 'Pick a facing on the ring (any turn costs 1 MP), or tap elsewhere to keep it. The thick edge of a block is its front. Later, ↻ Turn turns a selected unit.',
    until: 'facing',
  },
  {
    text: 'Now pin the line from the front: select your spearmen and tap the northern Canaanite unit. The preview shows a frontal attack — they strike back at full strength. Confirm.',
    until: 'charge',
    unit: 'bronzeAgeSpearmen',
  },
  {
    text: 'Support and flank: charge the same enemy with your chariots from its side. The preview now shows "Flank ×1.5" and a strike-back at half. Two units on one enemy break it fast.',
    until: 'support',
    unit: 'bronzeAgeChariots',
  },
  {
    text: 'Press End turn. Melee is fought at the end of every turn. An army breaks when units worth half of it have routed or died, or when its general falls.',
    until: 'endTurn',
  },
  {
    text: 'Keep both units on the same enemy until it breaks. Long-press any unit to read its card.',
    until: 'never',
  },
];

/** Kadesh (in battle): shooting with archers and using a general skill. */
export const KADESH_TUTORIAL: TutorialStep[] = [
  {
    text: 'Hittite chariots are crossing the Orontes. Tap your archers: the dotted squares show where they can shoot.',
    until: 'select',
    unit: 'bronzeAgeArchers',
  },
  {
    text: 'Archers hit up to three squares away, even over other units. Tap a red unit inside the dotted area and confirm the shot.',
    until: 'shoot',
    unit: 'bronzeAgeArchers',
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
  'Choose your troops: tap a slot to fill it. You may take several copies of one troop — try 2 Bronze Age archers to shoot the chariots as they cross.',
  'Pick a general below. Long-press a general card to read their skill: you will use it in battle.',
];

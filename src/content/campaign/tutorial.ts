import type { BuilderStep, TutorialStep } from './types';

/**
 * Tutorial scripts for Age 0 (GAME_DESIGN 7.4). Each step waits for a real game event
 * (`until`) and highlights the exact unit or square it means (`highlight`: scenario ids,
 * p0… for the player's units in army order, pg for the general, e0… for the enemy's).
 * The last step stays up as a reminder. Scripts are data: one per battle.
 */

/**
 * Megiddo: select, move, facing; flank beats front; support; how armies break. The player
 * has spearmen (p0) facing the Canaanite line and two chariots: p1 north of the line, p2
 * south of it. The two Canaanite units (e0 north, e1 south) face the spearmen, so their
 * flanks face the chariots.
 */
export const MEGIDDO_TUTORIAL: TutorialStep[] = [
  {
    text: 'You came through the Aruna pass before the Canaanite kings could form their line. Tap your spearmen, marked in gold. Your general, the Bronze Age Captain, waits behind them: if he falls, the battle is lost.',
    until: 'select',
    unit: 'bronzeAgeSpearmen',
    highlight: { units: ['p0'] },
  },
  {
    text: 'Blue squares show where a unit can go. Tap the gold square once to see a ghost of the move, then tap it again to confirm.',
    until: 'move',
    unit: 'bronzeAgeSpearmen',
    highlight: { squares: [{ x: 4, y: 3 }] },
  },
  {
    text: 'The thick edge of a block is its front: it fights and defends best that way. To turn, use the ↻ petal (1 MP). Your spearmen already face the enemy, so just tap the map to carry on.',
    until: 'facing',
    highlight: { units: ['p0'] },
  },
  {
    text: 'Pin their line: with your spearmen selected, tap the gold enemy and confirm. This is a frontal attack, so it strikes back at full strength.',
    until: 'charge',
    unit: 'bronzeAgeSpearmen',
    highlight: { units: ['p0', 'e0'] },
  },
  {
    text: 'Now its flank: tap your northern chariots, then the same enemy. The preview shows "Flank ×1.5", and it strikes back at half. Two units on one enemy is support: it breaks fast.',
    until: 'flankCharge',
    unit: 'bronzeAgeChariots',
    highlight: { units: ['p1', 'e0'] },
  },
  {
    text: 'Once more: your southern chariots can hit the other enemy in its open flank. Tap them, then the gold enemy.',
    until: 'flankCharge',
    unit: 'bronzeAgeChariots',
    highlight: { units: ['p2', 'e1'] },
  },
  {
    text: 'Press End turn. Melee is fought at the end of every turn. An army breaks when units worth half of it have routed or died, or when its general falls.',
    until: 'endTurn',
  },
  {
    text: 'The Canaanites strike back weakly. Keep charging the same enemies until their army breaks. Long-press any unit to read its card.',
    until: 'never',
  },
];

/** Kadesh (army builder): choosing troops, copies allowed, and a general. */
export const KADESH_BUILDER_STEPS: BuilderStep[] = [
  {
    text: 'Choose your troops: tap a gold slot and pick a troop. You may take the same troop more than once: two spearmen meet chariots well.',
    until: 'slots',
  },
  {
    text: 'Choose your general: tap the Bronze Age Captain. Long-press any card to read it. You will use his skill, Hold Fast, in battle.',
    until: 'general',
  },
];

/** Kadesh (in battle): shooting with archers and using a general skill. */
export const KADESH_TUTORIAL: TutorialStep[] = [
  {
    text: 'Hittite chariots are crossing the Orontes. Tap your archers, marked in gold: the dotted squares show where they can shoot.',
    until: 'select',
    unit: 'bronzeAgeArchers',
  },
  {
    text: 'Archers hit up to three squares away, even over other units. Tap a gold-marked enemy and confirm the shot. Out of range? Move the archers up behind your line first.',
    until: 'shoot',
    unit: 'bronzeAgeArchers',
    highlight: { targets: 'shoot' },
  },
  {
    text: 'Your general has a skill. Select the Captain (gold), press ★ General and use Hold Fast on a spearmen block that will meet the chariots.',
    until: 'skill',
    highlight: { units: ['pg'] },
  },
  {
    text: 'End your turn. The chariots will charge: spearmen facing them stop chariots cold, and a unit that turns its back is hit twice as hard.',
    until: 'endTurn',
  },
  {
    text: 'Now hit back: charge a gold-marked enemy, into its side if you can. Chariots hit hard and fall back after the impact.',
    until: 'charge',
    highlight: { targets: 'charge' },
  },
  {
    text: 'Break the Hittite army: units worth half of it must rout or fall. Keep your fronts towards the enemy.',
    until: 'never',
  },
];

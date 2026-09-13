export type GuideMotion = { open: number; round: number; energy: number; speaking: boolean; word: string };
export type TimedWord = { text: string; start: number; end: number };
export const restingMotion = (): GuideMotion => ({ open: 0, round: 0, energy: 0, speaking: false, word: "" });

/** Approximate visemes within real speech word boundaries; never claim forced phoneme alignment. */
export function mouthShape(word: string, position: number, energy: number) {
  const chars = Array.from(word.toLowerCase());
  const char = chars[Math.min(chars.length - 1, Math.floor(position * chars.length))] ?? "";
  const level = Math.min(1, Math.sqrt(Math.max(0, energy)));
  if (/[mpbमपब]/u.test(char)) return { open: .12 * level, round: 0 };
  if (/[ouोौूु]/u.test(char)) return { open: .5 * level, round: .8 };
  if (/[fvफव]/u.test(char)) return { open: .24 * level, round: 0 };
  if (/[aeaiआअाऐएै]/u.test(char)) return { open: .7 * level, round: .05 };
  if (/[iyईइीि]/u.test(char)) return { open: .34 * level, round: -.25 };
  return { open: (.32 + .22 * Math.sin(position * Math.PI)) * level, round: 0 };
}

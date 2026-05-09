export const AVATAR_SEEDS = [
  "Mochi", "Pixel", "Nova", "Blaze", "Frost", "Zephyr",
  "Cleo", "Orbit", "Sage", "Dusk", "Wren", "Echo",
  "Ember", "Tide", "Rune", "Wisp", "Comet", "Fern",
  "Lumi", "Ash", "Storm", "Birch", "Cedar", "Maple",
];

export function avatarUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${encodeURIComponent(seed)}`;
}

export const TILE = 64;

export const Color = {
  Yellow: 0,
  Red: 1,
  Pink: 2,
  Purple: 3,
  Blue: 4,
  Green: 5,
} as const;
export type Color = (typeof Color)[keyof typeof Color];

export const PALETTE: Record<Color, { base: string; hi: string; lo: string }> =
  {
    [Color.Yellow]: { base: "#FFBE0B", hi: "#FFDE85", lo: "#B08100" },
    [Color.Red]: { base: "#d62502", hi: "#ffa9a4", lo: "#b11308" },
    [Color.Pink]: { base: "#EC4899", hi: "#FBCFE8", lo: "#9D174D" },
    [Color.Purple]: { base: "#A855F7", hi: "#E9D5FF", lo: "#6B21A8" },
    [Color.Blue]: { base: "#3A86FF", hi: "#9CC2FF", lo: "#0045B5" },
    [Color.Green]: { base: "#22C55E", hi: "#BBF7D0", lo: "#15803D" },
  };

export const SPEED_DELAYS = [1000, 700, 500, 100, 50];
export const SPEED_LABELS = ["Slow", "Normal", "Fast", "Very Fast", "Instant"];

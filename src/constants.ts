export const TILE = 64;

export const Color = {
  Star:     0,
  Triangle: 1,
  Square:   2,
  Ellipse:  3,
  Diamond:  4,
  Clover:   5,
} as const;
export type Color = typeof Color[keyof typeof Color];

export const PALETTE: Record<Color, { base: string; hi: string; lo: string }> = {
  [Color.Star]:     { base: "#FFBE0B", hi: "#FFDE85", lo: "#B08100" },
  [Color.Triangle]: { base: "#F97316", hi: "#FED7AA", lo: "#C2410C" }, // clean orange — less burnt/dark than before
  // [Color.Triangle]: { base: "#FB5607", hi: "#FDAA84", lo: "#AE3903" },
  [Color.Square]:   { base: "#EC4899", hi: "#FBCFE8", lo: "#9D174D" }, // hot pink
  // [Color.Square]:   { base: "#FF006E", hi: "#FF80B7", lo: "#B0004C" },
  [Color.Ellipse]:  { base: "#A855F7", hi: "#E9D5FF", lo: "#6B21A8" }, // vivid violet — notably lighter than before
  // [Color.Ellipse]:  { base: "#8338EC", hi: "#C19BF6", lo: "#4E0FA5" },
  [Color.Diamond]:  { base: "#3A86FF", hi: "#9CC2FF", lo: "#0045B5" },
  [Color.Clover]:   { base: "#22C55E", hi: "#BBF7D0", lo: "#15803D" }, // fresh green
  // [Color.Clover]:   { base: "#5AD747", hi: "#ADEBA3", lo: "#30911F" },
	// [Color.Star]:     { base: "#F59E0B", hi: "#FDE68A", lo: "#92400E" }, // amber — richer than pale yellow on white
  // [Color.Diamond]:  { base: "#3B82F6", hi: "#BFDBFE", lo: "#1D4ED8" }, // vivid blue
};



export const SPEED_DELAYS = [1000, 700, 500, 100, 50];
export const SPEED_LABELS = ["Slow", "Normal", "Fast", "Very Fast", "Instant"];

import { COLS, ROWS, type Board } from "./game";
import { TILE, Color } from "./constants";

export interface TileAnim {
  color: Color;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  startFrame: number;
  durationFrames: number;
  hideCells: number[];
  easing: "cubic" | "quart";
}

export interface BurstAnim {
  color: Color;
  x: number;
  y: number;
  startFrame: number;
  durationFrames: number;
}

export function makeBurstAnims(
  board: Board,
  matched: ReadonlySet<number>,
  startFrame: number,
  durationFrames: number,
): BurstAnim[] {
  const anims: BurstAnim[] = [];
  for (const key of matched) {
    const r = (key / COLS) | 0, c = key % COLS;
    const color = board[r][c];
    if (color < 0) continue;
    anims.push({
      color: color as Color,
      x: c * TILE + TILE / 2,
      y: r * TILE + TILE / 2,
      startFrame,
      durationFrames,
    });
  }
  return anims;
}

export function makeFallAnims(
  before: Board,
  after: Board,
  startFrame: number,
  durationFrames: number,
): TileAnim[] {
  const anims: TileAnim[] = [];
  for (let c = 0; c < COLS; c++) {
    const bTiles: { r: number; color: Color }[] = [];
    for (let r = 0; r < ROWS; r++)
      if (before[r][c] >= 0) bTiles.push({ r, color: before[r][c] as Color });
    const aRows: number[] = [];
    for (let r = 0; r < ROWS; r++) if (after[r][c] >= 0) aRows.push(r);
    for (let i = 0; i < bTiles.length; i++) {
      const oldR = bTiles[i].r, newR = aRows[i];
      if (oldR !== newR)
        anims.push({
          color: bTiles[i].color,
          fromX: c * TILE,
          fromY: oldR * TILE,
          toX: c * TILE,
          toY: newR * TILE,
          startFrame,
          durationFrames,
          hideCells: [newR * COLS + c],
          easing: "quart",
        });
    }
  }
  return anims;
}

export function makeFillAnims(
  board: Board,
  emptyBefore: Set<number>,
  startFrame: number,
  durationFrames: number,
): TileAnim[] {
  const anims: TileAnim[] = [];
  const byCol = new Map<number, number[]>();
  for (const key of emptyBefore) {
    const r = (key / COLS) | 0, c = key % COLS;
    if (!byCol.has(c)) byCol.set(c, []);
    byCol.get(c)!.push(r);
  }
  for (const [c, rows] of byCol) {
    rows.sort((a, b) => a - b);
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i], above = rows.length - i;
      anims.push({
        color: board[r][c] as Color,
        fromX: c * TILE,
        fromY: -above * TILE,
        toX: c * TILE,
        toY: r * TILE,
        startFrame,
        durationFrames,
        hideCells: [r * COLS + c],
        easing: "quart",
      });
    }
  }
  return anims;
}

import { COLS, ROWS, type Board, type Move } from "./game";
import { TILE, PALETTE, Color } from "./constants";
import { drawStar, drawTriangle, drawSquare, drawEllipse, drawDiamond, drawClover } from "./shapes";
import type { TileAnim } from "./anim";

import gem1 from "./assets/gems/gem_01.png";
import gem2 from "./assets/gems/gem_02.png";
import gem3 from "./assets/gems/gem_03.png";
import gem4 from "./assets/gems/gem_04.png";
import gem5 from "./assets/gems/gem_05.png";
import gem6 from "./assets/gems/gem_06.png";

// Flip this to switch back to the hand-drawn canvas shapes.
const USE_GEM_SPRITES = true;

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function easeOutQuart(t: number) {
  return 1 - (1 - t) ** 4;
}

const GEM_SRC: Record<Color, string> = {
  [Color.Pink]: gem1,
  [Color.Purple]: gem2,
  [Color.Green]: gem3,
  [Color.Yellow]: gem4,
  [Color.Red]: gem5,
  [Color.Blue]: gem6,
};

const gemImages: Partial<Record<Color, HTMLImageElement>> = {};
for (const [color, src] of Object.entries(GEM_SRC)) {
  const img = new Image();
  img.src = src;
  gemImages[Number(color) as Color] = img;
}

function drawTileAtSprite(
  ctx: CanvasRenderingContext2D,
  color: Color,
  x: number,
  y: number,
  isMatched = false,
) {
  const img = gemImages[color];
  const p = 5, sz = TILE - p * 2;
  ctx.save();
  ctx.translate(x, y);
  if (isMatched) {
    ctx.shadowColor = PALETTE[color].base;
    ctx.shadowBlur = 15;
  }
  if (img && img.complete) {
    ctx.drawImage(img, p, p, sz, sz);
  }
  ctx.restore();
}

function drawTileAtShapes(
  ctx: CanvasRenderingContext2D,
  color: Color,
  x: number,
  y: number,
  isMatched = false,
) {
  const pal = PALETTE[color];
  const p = 5, sz = TILE - p * 2;
  ctx.save();
  ctx.translate(x, y);
  if (isMatched) {
    ctx.shadowColor = pal.base;
    ctx.shadowBlur = 15;
  }
	else {
		ctx.shadowColor = pal.lo;
		ctx.shadowOffsetX = -1;
		ctx.shadowOffsetY = 1;
		// ctx.shadowBlur = 3;
	}
  ctx.fillStyle = isMatched ? pal.lo : pal.base;
  switch (color) {
    case Color.Yellow:     drawStar(ctx, p, sz);     break;
    case Color.Red: drawTriangle(ctx, p, sz); break;
    case Color.Pink:   drawSquare(ctx, p, sz);   break;
    case Color.Purple:  drawEllipse(ctx, p, sz);  break;
    case Color.Blue:  drawDiamond(ctx, p, sz);  break;
    case Color.Green:   drawClover(ctx, p, sz);   break;
    default: {
      const _exhaustive: never = color;
      throw Error(`unexpected color: ${_exhaustive}`);
    }
  }
  ctx.fill();
  ctx.restore();
}

export function drawTileAt(
  ctx: CanvasRenderingContext2D,
  color: Color,
  x: number,
  y: number,
  isMatched = false,
) {
  if (USE_GEM_SPRITES) drawTileAtSprite(ctx, color, x, y, isMatched);
  else drawTileAtShapes(ctx, color, x, y, isMatched);
}

export function drawBoard(
  ctx: CanvasRenderingContext2D,
  board: Board,
  matched: ReadonlySet<number>,
  highlight: Move | null,
  anims: TileAnim[],
) {
  const W = COLS * TILE, H = ROWS * TILE;
  const now = performance.now();

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      ctx.fillStyle = (r + c) % 2 ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.075)";
      ctx.fillRect(c * TILE + 1, r * TILE + 1, TILE - 2, TILE - 2);
    }

  if (highlight) {
    const { r1, c1, r2, c2 } = highlight;
    ctx.strokeStyle = "rgb(255, 0, 0)";
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 3]);
    ctx.strokeRect(c1 * TILE + 3, r1 * TILE + 3, TILE - 6, TILE - 6);
    ctx.strokeRect(c2 * TILE + 3, r2 * TILE + 3, TILE - 6, TILE - 6);
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo((c1 + 0.5) * TILE, (r1 + 0.5) * TILE);
    ctx.lineTo((c2 + 0.5) * TILE, (r2 + 0.5) * TILE);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  const active = anims.filter((a) => now < a.startTime + a.duration);
  const hidden = new Set<number>();
  for (const a of active) for (const k of a.hideCells) hidden.add(k);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const key = r * COLS + c;
      if (hidden.has(key)) continue;
      const v = board[r][c];
      if (v < 0) continue;
      drawTileAt(ctx, v as Color, c * TILE, r * TILE, matched.has(key));
    }
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.clip();
  for (const a of active) {
    const t = Math.min((now - a.startTime) / a.duration, 1);
    const e = a.easing === "cubic" ? easeOutCubic(t) : easeOutQuart(t);
    drawTileAt(ctx, a.color, a.fromX + (a.toX - a.fromX) * e, a.fromY + (a.toY - a.fromY) * e);
  }
  ctx.restore();
}

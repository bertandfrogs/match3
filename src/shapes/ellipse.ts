export function drawEllipse(ctx: CanvasRenderingContext2D, p: number, sz: number) {
  const cx = sz / 2 + p;
  const cy = sz / 2 + p;
  ctx.beginPath();
  ctx.ellipse(cx, cy, sz / 2, sz / 2, 0, 0, 2 * Math.PI);
}

export function drawDiamond(ctx: CanvasRenderingContext2D, p: number, sz: number) {
  const cx = sz / 2;
  const cy = sz / 2;
  const radius = sz / 2;
  const points = 4;
  const step = (2 * Math.PI) / points;
  let rotation = -Math.PI / 2;

  ctx.beginPath();
  ctx.moveTo(cx + p + Math.cos(rotation) * radius, cy + p + Math.sin(rotation) * radius);
  for (let i = 1; i < points; i++) {
    rotation += step;
    ctx.lineTo(cx + p + Math.cos(rotation) * radius, cy + p + Math.sin(rotation) * radius);
  }
  ctx.closePath();
}

export function drawStar(ctx: CanvasRenderingContext2D, p: number, sz: number) {
  const cx = sz / 2;
  const cy = sz / 2;
  const outerRadius = sz / 2;
  const innerRadius = sz / 4;
  const points = 8;
  const step = Math.PI / points;
  let rotation = -Math.PI / 2;

  ctx.beginPath();
  ctx.moveTo(cx + p + Math.cos(rotation) * outerRadius, cy + p + Math.sin(rotation) * outerRadius);
  for (let i = 0; i < points; i++) {
    rotation += step;
    ctx.lineTo(cx + p + Math.cos(rotation) * innerRadius, cy + p + Math.sin(rotation) * innerRadius);
    rotation += step;
    ctx.lineTo(cx + p + Math.cos(rotation) * outerRadius, cy + p + Math.sin(rotation) * outerRadius);
  }
  ctx.closePath();
}

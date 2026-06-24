export function drawTriangle(ctx: CanvasRenderingContext2D, p: number, sz: number) {
  const radius = sz / 2 + p;
  const cx = sz / 2;
  const cy = sz / 2 + p;
  const points = 3;
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

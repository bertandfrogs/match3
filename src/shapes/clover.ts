function drawPetal(ctx: CanvasRenderingContext2D, length: number, width: number, pinch: number) {
  const tipX = 0;
  const tipY = -length;
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-width, -length * pinch, -width, -length, tipX, tipY);
  ctx.bezierCurveTo(tipX + width, tipY, width, -length * pinch, 0, 0);
}

export function drawClover(ctx: CanvasRenderingContext2D, p: number, sz: number) {
  const cx = sz / 2;
  const cy = sz / 2;
  const size = sz / 2 - p;
  const petalWidth = size * 0.6;
  const pinch = 0.5;

  ctx.save();
  ctx.translate(cx + p, cy + p);
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.rotate((Math.PI / 2) * i);
    drawPetal(ctx, size, petalWidth, pinch);
    ctx.restore();
  }
  ctx.closePath();
  ctx.restore();
}

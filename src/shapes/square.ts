export function drawSquare(ctx: CanvasRenderingContext2D, p: number, sz: number) {
  ctx.beginPath();
  ctx.rect(p * 2, p * 2, sz - p * 2, sz - p * 2);
}

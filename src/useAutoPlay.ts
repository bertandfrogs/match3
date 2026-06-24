import { useEffect, useRef, useState } from "react";
import { TILE, SPEED_DELAYS, SPEED_LABELS, Color } from "./constants";
import {
  COLS,
  ROWS,
  type Board,
  type Move,
  newBoard,
  findMatches,
  removeMatches,
  applyGravity,
  fillRandom,
  swapTiles,
  cloneBoard,
  findValidMoves,
  scoreMove,
  shuffleBoard,
} from "./game";
import { type TileAnim, makeFallAnims, makeFillAnims } from "./anim";
import { drawBoard } from "./renderer";

interface Stats {
  score: number;
  moves: number;
  cascades: number;
  shuffles: number;
  available: number;
  log: string;
}

const INIT_STATS: Stats = {
  score: 0,
  moves: 0,
  cascades: 0,
  shuffles: 0,
  available: 0,
  log: "Click Start to watch the AI play",
};

export function useAutoPlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<Board>(newBoard());
  const matchedRef = useRef<ReadonlySet<number>>(new Set());
  const highlightRef = useRef<Move | null>(null);
  const animsRef = useRef<TileAnim[]>([]);
  const autoRef = useRef(false);
  const busyRef = useRef(false);
  const speedRef = useRef(2);
  const runIdRef = useRef(0);

  const [stats, setStats] = useState<Stats>(INIT_STATS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedLabel, setSpeedLabel] = useState(SPEED_LABELS[1]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let rafId: number;
    const loop = () => {
      const now = performance.now();
      animsRef.current = animsRef.current.filter((a) => now < a.startTime + a.duration);
      drawBoard(ctx, boardRef.current, matchedRef.current, highlightRef.current, animsRef.current);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  function ms(frac = 1) {
    return Math.max(SPEED_DELAYS[speedRef.current] * frac, 20);
  }

  function sleep(frac = 1) {
    return new Promise<void>((res) => setTimeout(res, ms(frac)));
  }

  function animDur() {
    return Math.max(SPEED_DELAYS[speedRef.current] * 0.35, 55);
  }

  async function step(runId: number) {
    if (runId !== runIdRef.current || !autoRef.current || busyRef.current) return;
    busyRef.current = true;

    const board = boardRef.current;
    const validMoves = findValidMoves(board);

    if (validMoves.length === 0) {
      setStats((s) => ({ ...s, log: "No moves — shuffling board..." }));
      await sleep(1);
      if (runId !== runIdRef.current) { busyRef.current = false; return; }
      shuffleBoard(board);
      setStats((s) => ({ ...s, shuffles: s.shuffles + 1, log: "Shuffled! Continuing..." }));
      busyRef.current = false;
      if (autoRef.current && runId === runIdRef.current) setTimeout(() => step(runId), ms(0.4));
      return;
    }

    let best = validMoves[0];
    let bestScore = -1;
    for (const mv of validMoves) {
      const s = scoreMove(board, mv);
      if (s > bestScore) { bestScore = s; best = mv; }
    }

    highlightRef.current = best;
    setStats((s) => ({
      ...s,
      available: validMoves.length,
      log: `${validMoves.length} moves · best clears ${bestScore} tiles`,
    }));
    await sleep(0.3);
    if (runId !== runIdRef.current) { busyRef.current = false; return; }

    const dur = animDur();
    // Animate for dur ms visually, but keep cells hidden for 2 extra frames so
    // swapTiles can never race with the RAF loop unhiding them prematurely.
    const animHoldDur = dur + 32;
    const { r1, c1, r2, c2 } = best;
    const swapCells = [r1 * COLS + c1, r2 * COLS + c2];
    const swapStart = performance.now();
    animsRef.current.push(
      {
        color: board[r1][c1] as Color,
        fromX: c1 * TILE,
        fromY: r1 * TILE,
        toX: c2 * TILE,
        toY: r2 * TILE,
        startTime: swapStart,
        duration: animHoldDur,
        hideCells: swapCells,
        easing: "cubic",
      },
      {
        color: board[r2][c2] as Color,
        fromX: c2 * TILE,
        fromY: r2 * TILE,
        toX: c1 * TILE,
        toY: r1 * TILE,
        startTime: swapStart,
        duration: animHoldDur,
        hideCells: swapCells,
        easing: "cubic",
      },
    );
    await new Promise<void>((res) => setTimeout(res, dur));
    if (runId !== runIdRef.current) { busyRef.current = false; return; }

    swapTiles(board, r1, c1, r2, c2);
    highlightRef.current = null;

    let addedScore = 0;
    let cascadeBonus = 0;
    let iter = 0;
    let m = findMatches(board);

    while (m.length > 0) {
      addedScore += m.length * 10 * (iter + 1);

      matchedRef.current = new Set(m.map(({ r, c }) => r * COLS + c));
      setStats((s) => ({
        ...s,
        log: `Matched ${m.length} tiles!${iter > 0 ? ` (×${iter + 1} cascade)` : ""}`,
      }));
      await sleep(0.22);
      if (runId !== runIdRef.current) { busyRef.current = false; return; }

      matchedRef.current = new Set();
      removeMatches(board, m);

      const preGrav = cloneBoard(board);
      applyGravity(board);
      const fallDur = animDur() * 0.75;
      animsRef.current.push(...makeFallAnims(preGrav, board, performance.now(), fallDur));
      await new Promise<void>((res) => setTimeout(res, fallDur));
      if (runId !== runIdRef.current) { busyRef.current = false; return; }

      const emptyBefore = new Set<number>();
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++)
          if (board[r][c] < 0) emptyBefore.add(r * COLS + c);
      fillRandom(board);
      const fillDur = animDur() * 0.6;
      animsRef.current.push(...makeFillAnims(board, emptyBefore, performance.now(), fillDur));
      await new Promise<void>((res) => setTimeout(res, fillDur));
      if (runId !== runIdRef.current) { busyRef.current = false; return; }

      if (iter > 0) cascadeBonus++;
      iter++;
      m = findMatches(board);
    }

    const nowAvail = findValidMoves(board).length;
    setStats((s) => ({
      ...s,
      score: s.score + addedScore,
      moves: s.moves + 1,
      cascades: s.cascades + (cascadeBonus > 0 ? 1 : 0),
      available: nowAvail,
      log: nowAvail === 0 ? "No moves left..." : "Thinking...",
    }));

    busyRef.current = false;
    if (autoRef.current && runId === runIdRef.current) setTimeout(() => step(runId), ms(0.18));
  }

  function handleTogglePlay() {
    const next = !isPlaying;
    setIsPlaying(next);
    autoRef.current = next;
    if (next) {
      const id = ++runIdRef.current;
      step(id);
    } else {
      setStats((s) => ({ ...s, log: "Paused" }));
    }
  }

  function handleReset() {
    runIdRef.current++;
    autoRef.current = false;
    busyRef.current = false;
    setIsPlaying(false);
    boardRef.current = newBoard();
    matchedRef.current = new Set();
    highlightRef.current = null;
    animsRef.current = [];
    setStats({ ...INIT_STATS, log: "Board reset — click Start to play" });
  }

  function handleSpeed(e: React.ChangeEvent<HTMLInputElement>) {
    const idx = Number(e.target.value);
    speedRef.current = idx;
    setSpeedLabel(SPEED_LABELS[idx]);
  }

  return { canvasRef, stats, isPlaying, speedLabel, handleTogglePlay, handleReset, handleSpeed };
}

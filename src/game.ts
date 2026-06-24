export const ROWS = 6;
export const COLS = 12;
export const NUM_COLORS = 6;

export type Board = number[][];
export interface Pos { r: number; c: number }
export interface Move { r1: number; c1: number; r2: number; c2: number }

export function newBoard(): Board {
  const b: Board = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let color: number;
      do {
        color = Math.floor(Math.random() * NUM_COLORS);
      } while (
        (c >= 2 && b[r][c - 1] === color && b[r][c - 2] === color) ||
        (r >= 2 && b[r - 1][c] === color && b[r - 2][c] === color)
      );
      b[r][c] = color;
    }
  }
  ensureValidMoves(b);
  return b;
}

export function findMatches(board: Board): Pos[] {
  const found = new Set<number>();

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c + 2 < COLS; c++) {
      const v = board[r][c];
      if (v < 0) continue;
      if (board[r][c + 1] === v && board[r][c + 2] === v) {
        let e = c + 2;
        while (e + 1 < COLS && board[r][e + 1] === v) e++;
        for (let i = c; i <= e; i++) found.add(r * COLS + i);
        c = e;
      }
    }
  }

  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r + 2 < ROWS; r++) {
      const v = board[r][c];
      if (v < 0) continue;
      if (board[r + 1][c] === v && board[r + 2][c] === v) {
        let e = r + 2;
        while (e + 1 < ROWS && board[e + 1][c] === v) e++;
        for (let i = r; i <= e; i++) found.add(i * COLS + c);
        r = e;
      }
    }
  }

  return [...found].map(k => ({ r: (k / COLS) | 0, c: k % COLS }));
}

export function removeMatches(board: Board, matches: Pos[]): void {
  for (const { r, c } of matches) board[r][c] = -1;
}

export function applyGravity(board: Board): void {
  for (let c = 0; c < COLS; c++) {
    let empty = ROWS - 1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][c] >= 0) {
        board[empty][c] = board[r][c];
        if (empty !== r) board[r][c] = -1;
        empty--;
      }
    }
  }
}

export function fillRandom(board: Board): void {
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (board[r][c] < 0)
        board[r][c] = Math.floor(Math.random() * NUM_COLORS);
}

export function swapTiles(board: Board, r1: number, c1: number, r2: number, c2: number): void {
  const t = board[r1][c1];
  board[r1][c1] = board[r2][c2];
  board[r2][c2] = t;
}

export function cloneBoard(board: Board): Board {
  return board.map(row => [...row]);
}

export function findValidMoves(board: Board): Move[] {
  const moves: Move[] = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 1; c++) {
      swapTiles(board, r, c, r, c + 1);
      if (findMatches(board).length > 0) moves.push({ r1: r, c1: c, r2: r, c2: c + 1 });
      swapTiles(board, r, c, r, c + 1);
    }
  }

  for (let r = 0; r < ROWS - 1; r++) {
    for (let c = 0; c < COLS; c++) {
      swapTiles(board, r, c, r + 1, c);
      if (findMatches(board).length > 0) moves.push({ r1: r, c1: c, r2: r + 1, c2: c });
      swapTiles(board, r, c, r + 1, c);
    }
  }

  return moves;
}

// Score a move by simulating full cascade on existing tiles (no random fill).
// Higher = better move.
export function scoreMove(board: Board, move: Move): number {
  const sim = cloneBoard(board);
  swapTiles(sim, move.r1, move.c1, move.r2, move.c2);
  let total = 0;
  let m = findMatches(sim);
  while (m.length > 0) {
    total += m.length;
    removeMatches(sim, m);
    applyGravity(sim);
    m = findMatches(sim);
  }
  return total;
}

// Inject a guaranteed valid move when the board has none.
// Places pattern [A, A, B, A] in a row so swapping B↔A creates AAA.
export function ensureValidMoves(board: Board): void {
  if (findValidMoves(board).length > 0) return;
  const color = Math.floor(Math.random() * NUM_COLORS);
  const alt = (color + 1) % NUM_COLORS;
  const r = Math.floor(Math.random() * ROWS);
  const c = Math.floor(Math.random() * (COLS - 3));
  board[r][c] = color;
  board[r][c + 1] = color;
  board[r][c + 2] = alt;   // swapping c+2 ↔ c+3 → [A,A,A,alt] ✓
  board[r][c + 3] = color;
}

// Shuffle tiles until a valid move exists (succeeds in <5 tries empirically).
export function shuffleBoard(board: Board): void {
  const tiles: number[] = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      tiles.push(board[r][c]);

  for (let attempt = 0; attempt < 200; attempt++) {
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    let idx = 0;
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        board[r][c] = tiles[idx++];

    if (findValidMoves(board).length > 0) return;
  }

  ensureValidMoves(board);
}

// Pick the move that clears the most tiles (with cascade bonus).
export function bestMove(board: Board): Move | null {
  const moves = findValidMoves(board);
  if (moves.length === 0) return null;
  let best = moves[0];
  let bestScore = -1;
  for (const mv of moves) {
    const s = scoreMove(board, mv);
    if (s > bestScore) { bestScore = s; best = mv; }
  }
  return best;
}

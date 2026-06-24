import { COLS, ROWS } from "./game";
import { TILE } from "./constants";
import { useAutoPlay } from "./useAutoPlay";
import "./App.css";

export default function App() {
  const { canvasRef, stats, isPlaying, speedLabel, handleTogglePlay, handleReset, handleSpeed } =
    useAutoPlay();

  return (
    <div className="app">
      <h1>Match-3 Auto-Play</h1>
      <div className="layout">
        <canvas
          ref={canvasRef}
          width={COLS * TILE}
          height={ROWS * TILE}
          className="game-canvas"
        />
        <div className="panel">
          <div className="card">
            <div className="card-label">Score</div>
            <div className="big-num">{stats.score.toLocaleString()}</div>
          </div>

          <div className="card">
            <div className="card-label">Stats</div>
            <div className="stat-list">
              <div className="stat-row">
                <span>Moves</span>
                <span>{stats.moves}</span>
              </div>
              <div className="stat-row">
                <span>Cascades</span>
                <span>{stats.cascades}</span>
              </div>
              <div className="stat-row">
                <span>Shuffles</span>
                <span>{stats.shuffles}</span>
              </div>
              <div className="stat-row">
                <span>Available</span>
                <span>{stats.available}</span>
              </div>
            </div>
          </div>

          <button
            className={`btn ${isPlaying ? "btn-stop" : "btn-play"}`}
            onClick={handleTogglePlay}
          >
            {isPlaying ? "■  Stop" : "▶  Start"}
          </button>

          <button className="btn btn-reset" onClick={handleReset}>
            ↺ Reset
          </button>

          <div className="card">
            <div className="speed-header">
              <span>Speed</span>
              <span className="speed-value">{speedLabel}</span>
            </div>
            <input
              type="range"
              min={0}
              max={4}
              defaultValue={1}
              onChange={handleSpeed}
            />
          </div>

          <div className="card">
            <div className="card-label">Status</div>
            <div className="log-text">{stats.log}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

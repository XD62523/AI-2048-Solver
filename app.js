let board = [];
let score = 0;
let bestScore = 0;
let aiRunning = false;
let aiTimer = null;

// Initialize or reset the game
function resetGame() {
  stopAI();
  board = createBoard();
  score = 0;
  spawnTile(board);
  spawnTile(board);
  renderBoard();
  let statusEl = document.getElementById("status");
  statusEl.textContent = "Press Arrow Keys, Swipe, or click Start AI";
  statusEl.style.color = "";
}

// Draw the 4x4 board and scores onto the HTML page
function renderBoard() {
  let gridEl = document.getElementById("grid");
  gridEl.innerHTML = "";

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      let val = board[r][c];
      let cell = document.createElement("div");
      cell.className = "cell" + (val ? (val <= 2048 ? ` t-${val}` : " t-super") : "");
      cell.textContent = val || "";
      gridEl.appendChild(cell);
    }
  }

  document.getElementById("score").textContent = score;
  if (score > bestScore) bestScore = score;
  document.getElementById("best-score").textContent = bestScore;
}

// Execute a move in direction (0: Left, 1: Down, 2: Right, 3: Up)
function handleMove(dir) {
  let sim = move(board, dir);
  if (!sim.moved) return false;

  board = sim.newBoard;
  score += sim.scoreGained;
  spawnTile(board);
  renderBoard();

  if (hasWon(board)) {
    stopAI();
    let statusEl = document.getElementById("status");
    statusEl.textContent = "🎉 YOU WIN! Reached 2048! Final Score: " + score;
    statusEl.style.color = "#16a34a";
    return true;
  }

  if (isGameOver(board)) {
    stopAI();
    document.getElementById("status").textContent = "Game Over! Final Score: " + score;
    return true;
  }

  return true;
}

// Run one single AI decision step
function stepAI() {
  if (hasWon(board) || isGameOver(board)) return;
  let depth = parseInt(document.getElementById("depth-select").value, 10);
  let bestDir = getBestMove(board, depth);

  if (bestDir !== -1) {
    let dirNames = ["Left", "Down", "Right", "Up"];
    document.getElementById("status").textContent = `AI Status: Running (Depth ${depth}) | Last Move: ${dirNames[bestDir]}`;
    handleMove(bestDir);
  }
}

// Toggle continuous AI auto-play
function toggleAI() {
  if (aiRunning) {
    stopAI();
  } else {
    aiRunning = true;
    let btn = document.getElementById("ai-btn");
    btn.textContent = "Stop AI";
    btn.classList.add("running");
    runAILoop();
  }
}

function stopAI() {
  aiRunning = false;
  clearTimeout(aiTimer);
  let btn = document.getElementById("ai-btn");
  btn.textContent = "Start AI";
  btn.classList.remove("running");
}

function runAILoop() {
  if (!aiRunning) return;
  stepAI();
  if (!hasWon(board) && !isGameOver(board)) {
    let depth = parseInt(document.getElementById("depth-select").value, 10);
    let delayMap = {
      2: 350,
      3: 120,
      4: 10
    };
    let delay = delayMap[depth] || 120;
    aiTimer = setTimeout(runAILoop, delay);
  }
}

// Keyboard arrow support for manual testing
window.addEventListener("keydown", function (e) {
  if (aiRunning) return;
  let keyMap = { ArrowLeft: 0, ArrowDown: 1, ArrowRight: 2, ArrowUp: 3 };
  if (e.key in keyMap) {
    e.preventDefault();
    handleMove(keyMap[e.key]);
  }
});

// Mobile Touch Swipe Controls (0: Left, 1: Down, 2: Right, 3: Up)
// Mobile Touch Swipe Controls (0: Left, 1: Down, 2: Right, 3: Up)
let touchStartX = 0;
let touchStartY = 0;

const gridElement = document.getElementById("grid");

gridElement.addEventListener("touchstart", function (e) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

gridElement.addEventListener("touchmove", function (e) {
  e.preventDefault();
}, { passive: false });

gridElement.addEventListener("touchend", function (e) {
  if (aiRunning || !e.changedTouches.length) return;

  let dx = e.changedTouches[0].clientX - touchStartX;
  let dy = e.changedTouches[0].clientY - touchStartY;

  if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;

  if (Math.abs(dx) > Math.abs(dy)) {
    handleMove(dx > 0 ? 2 : 0); // Right (2) or Left (0)
  } else {
    handleMove(dy > 0 ? 1 : 3); // Down (1) or Up (3)
  }
});


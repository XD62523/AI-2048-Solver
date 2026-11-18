// 1. Create a 4x4 grid filled with 0s
function createBoard() {
  let board = [];
  for (let r = 0; r < 4; r++) {
    board.push([0, 0, 0, 0]);
  }
  return board;
}

// 2. Spawn a 2 (90%) or 4 (10%) on a random empty cell
function spawnTile(board) {
  let emptyCells = [];

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) { // Fixed: c < 4
      if (board[r][c] === 0) {
        emptyCells.push({ r: r, c: c });
      }
    }
  }
  if (emptyCells.length === 0) return;

  let randomIndex = Math.floor(Math.random() * emptyCells.length);
  let chosenCell = emptyCells[randomIndex];
  board[chosenCell.r][chosenCell.c] = Math.random() < 0.9 ? 2 : 4;
}

// 3. Slide and merge a single 1D row to the left
function slideLeft(row) {
  let arr = row.filter(num => num !== 0);
  let scoreGained = 0;

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      scoreGained += arr[i];
      arr.splice(i + 1, 1);
    }
  }

  while (arr.length < 4) {
    arr.push(0);
  }

  return { newRow: arr, scoreGained: scoreGained };
}

// 4. Rotate a 4x4 board 90 degrees clockwise
function rotateClockwise(board) {
  let newBoard = createBoard(); // Fixed: capital B
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) { // Fixed: c < 4
      newBoard[c][3 - r] = board[r][c];
    }
  }
  return newBoard;
}

// 5. Execute a move (0: Left, 1: Down, 2: Right, 3: Up)
function move(board, direction) {
  let tempBoard = board.map(row => [...row]);

  // Rotate so target direction faces Left
  for (let i = 0; i < direction; i++) {
    tempBoard = rotateClockwise(tempBoard);
  }

  // Slide all 4 rows left
  let totalScore = 0;
  for (let r = 0; r < 4; r++) {
    let result = slideLeft(tempBoard[r]);
    tempBoard[r] = result.newRow;
    totalScore += result.scoreGained;
  }

  // Rotate back to original orientation
  for (let i = 0; i < (4 - direction) % 4; i++) {
    tempBoard = rotateClockwise(tempBoard);
  }

  // Check if any tile changed position
  let moved = false;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] !== tempBoard[r][c]) {
        moved = true;
      }
    }
  }

  return { newBoard: tempBoard, moved: moved, scoreGained: totalScore };
}

function hasWon(board) {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] === 2048) {
                return true;
            }
        }
    }
    return false;
}

function isGameOver(board) {
  for (let dir = 0; dir < 4; dir++) {
    if (move(board, dir).moved) {
      return false;
    }
  }
  return true;
}

// --- TEST YOUR CODE ---
//const board = createBoard();
//spawnTile(board);
//spawnTile(board);
//console.table(board);
//let testMove = move(board, 0);
//console.table(testMove.newBoard);

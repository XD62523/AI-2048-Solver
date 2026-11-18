const SNAKE_WEIGHT = [
    [65536, 32768, 16384, 8192],
    [  512,  1024,  2048, 4096],
    [  256,   128,    64,   32],
    [    2,     4,     8,   16],
];

function evaluateBoard(board) {
    let weightScore = 0;
    let emptyCells = 0;
    let smoothnessPenalty = 0;

    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            let val = board[r][c];

            if (val === 0) {
                emptyCells++;
            } else {
                weightScore += val * SNAKE_WEIGHT[r][c];
                
                if (c < 3 && board[r][c + 1] !== 0) {
                    smoothnessPenalty += Math.abs(val - board[r][c + 1]);
                }
               
                if (r < 3 && board[r + 1][c] !== 0) {
                    smoothnessPenalty += Math.abs(val - board[r + 1][c]);
                }
            }
        }
    }
    return weightScore + (emptyCells * 50) - smoothnessPenalty;
}

function expectimax(board, depth, isPlayerTurn, memo) {
    if (depth === 0) {
        return { score: evaluateBoard(board), move: -1 };
    }

    let stateKey = board.toString() + "_" + depth + "_" + isPlayerTurn;
    if (memo.has(stateKey)) {
        return memo.get(stateKey);
    }
    let result;

    if (isPlayerTurn) {
        let bestScore = -Infinity;
        let bestMove = -1;

        for (let dir = 0; dir < 4; dir++) {
            let sim = move(board, dir);
            if (!sim.moved) continue;

            let child = expectimax(sim.newBoard, depth - 1, false, memo);
            if (child.score > bestScore) {
                bestScore = child.score;
                bestMove = dir;
            }
        }

        result = bestMove === -1 ? { score: -1e9, move: -1 } : { score: bestScore, move: bestMove };
    } else {
        let emptyCells = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (board[r][c] === 0) {
                    emptyCells.push({ r: r, c: c });
                }
            }
        }

        if (emptyCells.length === 0) {
            result = { score: evaluateBoard(board), move: -1 };
        } else {
            let candidates = emptyCells.length > 6 ? emptyCells.slice(0, 6) : emptyCells;
            let expectedScore = 0;

            for (let i = 0; i < candidates.length; i++) {
                let cell = candidates[i];

                board[cell.r][cell.c] = 2;
                expectedScore += 0.9 * expectimax(board, depth - 1, true, memo).score;

                board[cell.r][cell.c] = 4;
                expectedScore += 0.1 * expectimax(board, depth - 1, true, memo).score;

                board[cell.r][cell.c] = 0;
            }

            result = { score: expectedScore / candidates.length, move: -1 };
        }
    }

    memo.set(stateKey, result);
    return result;
}

function getBestMove(board, depth = 3) {
    let memo = new Map();
    return expectimax(board, depth, true, memo).move;
}

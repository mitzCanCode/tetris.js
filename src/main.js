import './style.css'
import { Block } from "./Blocks.js";
import { BlockColor, BOARD_HEIGHT, BOARD_WIDTH } from "./Constants.js";


var renderSpeed = 1200;
var score = 0;
var linesCleared = 0;



class Cell {
    constructor(color = BlockColor.EMPTY) {
        this.color = color;
    }

    get cellStyle() {
        return {
            className: "tetris-block",
            style: `--block-color:${this.color};`
        };
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Get the board element from the DOM
const boardRef = document.getElementById('board');
// Create a 2D array of empty cells to represent the game board
var gameBoard = Array.from(
    { length: BOARD_HEIGHT },
    () => Array.from({ length: BOARD_WIDTH }, () => new Cell())
);

function renderBoard(boardRef, gameBoard) {
    // Reset the board
    boardRef.innerHTML = "";
    // Read board from top left to bottom right
    for (let i = 0; i < BOARD_HEIGHT; i++) {
        for (let j = 0; j < BOARD_WIDTH; j++) {
            // Create a new cell element
            const cell = document.createElement('div');
            const cellStyle = gameBoard[i][j].cellStyle;
            // Give the class name and style of the cell based on the game board state
            cell.className = cellStyle.className;
            cell.style.cssText = cellStyle.style;
            // Set the data-index attribute to the cell's index in the game board
            cell.dataset.index = `${i},${j}`;
            // Append the cell to the board
            boardRef.appendChild(cell);
        }
    }
};

let currentBlock = new Block();

function renderCurrentBlock(board) {
    const blockCells = currentBlock.getRenderCoordinates();
    
    for (const cell of blockCells) {
        if (
            cell.row >= 0 &&
            cell.row < BOARD_HEIGHT &&
            cell.col >= 0 &&
            cell.col < BOARD_WIDTH
        ) {
            board[cell.row][cell.col].color = cell.color;
        }
    }
}

function lockBlock() {
    for (const cell of currentBlock.getRenderCoordinates()) {
        if ( cell.row >= 0 && cell.row < BOARD_HEIGHT && 
            cell.col >= 0 && cell.col < BOARD_WIDTH ) {
            gameBoard[cell.row][cell.col].color = cell.color;
        }
    }
}

function updateScore(lines) {
    linesCleared += lines;

    const level = Math.floor(linesCleared / 10);

    switch(lines) {
        case 1:
            score += 40 * (level + 1);
            break;

        case 2:
            score += 100 * (level + 1);
            break;

        case 3:
            score += 300 * (level + 1);
            break;

        case 4:
            score += 1200 * (level + 1);
            break;
    }
    updateStats()
}

function updateStats() {
    const level = Math.floor(linesCleared / 10);
    document.getElementById("score").textContent =
        `Score: ${score}`;
    document.getElementById("lines").textContent =
        `Lines: ${linesCleared}`;
    document.getElementById("level").textContent =
        `Level: ${level}`;
}

async function clearLines() {
    let clearedLines = [];

    // Find full rows
    for (let row = 0; row < BOARD_HEIGHT; row++) {
        let full = true;

        for (let col = 0; col < BOARD_WIDTH; col++) {
            if (gameBoard[row][col].color === BlockColor.EMPTY) {
                full = false;
                break;
            }
        }

        if (full) {
            clearedLines.push(row);
        }
    }

    if (clearedLines.length === 0) {
        return;
    }

    // Flash settings 
    const flashes = 3;
    const delay = 1000 / (flashes * 2);

    for (let i = 0; i < flashes; i++) {
        // Empty the lines
        for (const row of clearedLines) {
            for (let col = 0; col < BOARD_WIDTH; col++) {
                gameBoard[row][col].color = BlockColor.EMPTY;
            }
        }

        draw();

        await sleep(delay);

        // Make them white
        for (const row of clearedLines) {
            for (let col = 0; col < BOARD_WIDTH; col++) {
                gameBoard[row][col].color = BlockColor.WHITE;
            }
        }

        draw();

        await sleep(delay);
    }

    // Remove lines and shift down
    let writeRow = BOARD_HEIGHT - 1;

    for (let readRow = BOARD_HEIGHT - 1; readRow >= 0; readRow--) {
        let full = true;
        for (let col = 0; col < BOARD_WIDTH; col++) {
            if (gameBoard[readRow][col].color === BlockColor.EMPTY) {
                full = false;
                break;
            }
        }

        if (!full) {
            if (writeRow !== readRow) {
                for (let col = 0; col < BOARD_WIDTH; col++) {
                    gameBoard[writeRow][col].color =
                        gameBoard[readRow][col].color;
                }
            }

            writeRow--;
        }
    }

    // Clear remaining top rows
    for (let row = writeRow; row >= 0; row--) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
            gameBoard[row][col].color = BlockColor.EMPTY;
        }
    }

    updateScore(clearedLines.length);
}

function renderBelowBlock(board) {
    const cells = currentBlock.getRenderCoordinates();
    for (const {row, col} of cells) {
        for (let r = row + 1; r < BOARD_HEIGHT; r++) {
            if (board[r][col].color === BlockColor.EMPTY) {
                board[r][col].color = BlockColor.GHOST;
            }
        }
    }
}

function draw() {
    const renderBoardState = gameBoard.map(
        row => row.map(cell => new Cell(cell.color))
    );

    renderBelowBlock(renderBoardState);
    renderCurrentBlock(renderBoardState);
    renderBoard(boardRef, renderBoardState);
}

async function gameLoop() {
    // Try moving down
    const moved = currentBlock.moveDown(gameBoard);

    // If blocked, lock the block
    if (!moved) {
        lockBlock();
        
        await clearLines();
        
        currentBlock = new Block();
        // Game over check
        if (!currentBlock.canMove(
            gameBoard,
            currentBlock.getBoardCoordinates()
        )) {
            console.log("Game Over");
        }
    }

    draw(); // Update the board
}

// Add controls
document.addEventListener(
    "keydown",
    async (event)=>{
        switch(event.key.toLowerCase()){
            case "a":
            case "arrowleft":
                currentBlock.moveLeft(gameBoard);
                break;

            case "d":
            case "arrowright":
                currentBlock.moveRight(gameBoard);
                break;

            case "s":
            case "arrowdown":
                currentBlock.moveDown(gameBoard);
                break;

            case "w":
            case "arrowup":
                currentBlock.rotate(gameBoard);
                break;
            
            case " ":
                while (true) {
                    const moved = currentBlock.moveDown(gameBoard);

                    // If blocked, lock the block
                    if (!moved) {
                        lockBlock();

                        await clearLines();
                        
                        currentBlock = new Block();
                        // Game over check
                        if (!currentBlock.canMove(
                            gameBoard,
                            currentBlock.getBoardCoordinates()
                        )) {
                            console.log("Game Over");
                        }
                        break;
                    }
                }
        }
        draw();
    }
);

document.addEventListener("DOMContentLoaded", () => {
    draw();
    updateStats();
    setInterval(gameLoop, renderSpeed);
});
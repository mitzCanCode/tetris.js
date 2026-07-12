import './style.css'
import { Block } from "./Blocks.js";
import { BlockColor, BOARD_HEIGHT, BOARD_WIDTH } from "./Constants.js";


var renderSpeed = 1200;
var score = 0;



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

function gameLoop() {
    // Try moving down
    const moved = currentBlock.moveDown(gameBoard);

    // If blocked, lock the block
    if (!moved) {
        lockBlock();
        currentBlock = new Block();
        // Game over check
        if (!currentBlock.canMove(
            gameBoard,
            currentBlock.getBoardCoordinates()
        )) {
            console.log("Game Over");
        }
    }

    // Create temporary board copy for rendering
    const renderBoardState = gameBoard.map(
        row => row.map(
            cell => new Cell(cell.color)
        )
    );

    renderCurrentBlock(renderBoardState);

    renderBoard(
        boardRef,
        renderBoardState
    );
}

// Add controlls
document.addEventListener(
    "keydown",
    (event)=>{
        switch(event.key){
            case "ArrowLeft":
                currentBlock.moveLeft(gameBoard);
                break;

            case "ArrowRight":
                currentBlock.moveRight(gameBoard);
                break;

            case "ArrowDown":
                currentBlock.moveDown(gameBoard);
                break;

            case "ArrowUp":
                currentBlock.rotate(gameBoard);
                break;
        }
    }
);

document.addEventListener("DOMContentLoaded", () => {
    renderBoard(boardRef, gameBoard); // Initial render
    setInterval(() => {
        gameLoop();
    }, renderSpeed);
});
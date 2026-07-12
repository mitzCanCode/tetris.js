import { BlockColor, BOARD_HEIGHT, BOARD_WIDTH } from "./Constants.js";

export class Block {

    constructor() {
        this.coordinates = [
            [0,0],
            [0,0],
            [0,0],
            [0,0]
        ];
        this.center = {
            row: 0,
            column: 5
        };
        this.color = this.newBlock();
    }

    // Generate random tetromino
    newBlock() {
        const choice = Math.floor(Math.random() * 7);

        switch(choice) {

            case 0: // T
                this.coordinates = [
                    [2,2],
                    [1,2],
                    [2,1],
                    [2,3]
                ];
                return BlockColor.P;


            case 1: // J
                this.coordinates = [
                    [2,2],
                    [1,1],
                    [2,1],
                    [2,3]
                ];
                return BlockColor.B;


            case 2: // L
                this.coordinates = [
                    [2,2],
                    [1,3],
                    [2,1],
                    [2,3]
                ];
                return BlockColor.O;


            case 3: // O
                this.coordinates = [
                    [1,1],
                    [1,2],
                    [2,1],
                    [2,2]
                ];
                return BlockColor.Y;


            case 4: // S
                this.coordinates = [
                    [2,2],
                    [1,2],
                    [1,3],
                    [2,1]
                ];
                return BlockColor.G;


            case 5: // Z
                this.coordinates = [
                    [2,2],
                    [1,1],
                    [1,2],
                    [2,3]
                ];
                return BlockColor.R;


            case 6: // I
                this.coordinates = [
                    [1,1],
                    [1,0],
                    [1,2],
                    [1,3]
                ];
                return BlockColor.C;
        }
    }


    // Convert relative coordinates into board coordinates
    getBoardCoordinates() {
        const result = [];

        const centerX = this.coordinates[0][0];
        const centerY = this.coordinates[0][1];

        for(const [x,y] of this.coordinates) {
            result.push([
                this.center.row + x - centerX,
                this.center.column + y - centerY
            ]);
        }

        return result;
    }

    canMove(gameBoard, testCoordinates) {
        for (const [row, col] of testCoordinates) {
            // Out of bounds
            if ( row < 0 || row >= BOARD_HEIGHT || col < 0 || col >= BOARD_WIDTH ) {
                return false;
            }

            // Collision with existing block
            if (gameBoard[row][col].color !== BlockColor.EMPTY) {
                return false;
            }
        }
        return true;
    }


    // Rotate clockwise
    rotate(gameBoard) {
        // Square doesnt rotate
        if(this.color === BlockColor.Y)
            return;

        const oldCoordinates = this.cloneCoordinates();

        let matrix = Array.from(
            {length:5},
            ()=>Array(5).fill(null)
        );

        for(const [x,y] of this.coordinates) {
            matrix[x][y] = this.color;
        }

        // transpose
        for(let i=0;i<5;i++) {
            for(let j=i+1;j<5;j++) {

                let temp = matrix[i][j];
                matrix[i][j] = matrix[j][i];
                matrix[j][i] = temp;

            }
        }

        // reverse rows
        for(let i=0;i<5;i++) {
            matrix[i].reverse();
        }

        let index = 0;
        for(let i=0;i<5;i++) {
            for(let j=0;j<5;j++) {
                if(matrix[i][j] !== null) {
                    this.coordinates[index] = [i,j];
                    index++;
                }
            }
        }

        // Check new position
        if (!this.canMove(gameBoard, this.getBoardCoordinates())) {
            // Undo rotation
            this.coordinates = oldCoordinates;
            return false;
        }

        return true;
    }

    moveLeft(gameBoard) {
        const currentPositions = this.getBoardCoordinates();

        // Test position first
        const testPositions = currentPositions.map(
            ([row, col]) => [row, col - 1]
        );

        if (!this.canMove(gameBoard, testPositions)) {
            return false;
        }

        // Apply movement
        this.center.column--;
        return true;
    }

    // Move right
    moveRight(gameBoard) {
        const currentPositions = this.getBoardCoordinates();

        // Test position first
        const testPositions = currentPositions.map(
            ([row, col]) => [row, col + 1]
        );

        if (!this.canMove(gameBoard, testPositions)) {
            return false;
        }

        // Apply movement
        this.center.column++;
        return true;
    }

    // Move down
    moveDown(gameBoard) {
        const currentPositions = this.getBoardCoordinates();

        // Test position first
        const testPositions = currentPositions.map(
            ([row, col]) => [row + 1, col]
        );

        if (!this.canMove(gameBoard, testPositions)) {
            return false;
        }

        // Apply movement
        this.center.row++;
        return true;
    }

    cloneCoordinates() {
        return this.coordinates.map(
            ([x,y]) => [x,y]
        );
    }

    getRenderCoordinates() {
        return this.getBoardCoordinates().map(
            ([row,col]) => ({
                row,
                col,
                color:this.color
            })
        );
    }

}
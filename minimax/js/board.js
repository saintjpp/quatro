function Board(game, field, player) {
    this.game = game
    this.field = field;
    this.player = player;
}

Board.prototype.isFinished = function(depth, score) {
    if (depth == 0 || score == this.game.score || score == -this.game.score || this.isFull()) {
        return true;
    }
    return false;
}

Board.prototype.isFull = function() {
    for (let i = 0; i < this.game.columns; i++) {
        if (this.field[0][i] == null) {
            return false;
        }
    }
    return true;
}

Board.prototype.place = function(column) {
    if (this.field[0][column] == null && column >= 0 && column < this.game.columns) {
        for (let y = this.game.rows - 1; y >= 0; y--) {
            if (this.field[y][column] == null) {
                this.field[y][column] = this.player;
                break;
            }
        }
        this.player = this.game.switchRound(this.player);
        return true;
    } else {
        return false;
    }
}

Board.prototype.scorePosition = function(row, column, delta_y, delta_x) {
    let humanPoints = 0;
    let computerPoints = 0;

    // Save winning positions to arrays for later usage
    this.game.winningArrayHuman = [];
    this.game.winningArrayCPU = [];

    // Determine score through amount of available chips
    for (let i = 0; i < 4; i++) {
        if (this.field[row][column] == 0) {
            this.game.winningArrayHuman.push([row, column]);
            humanPoints++; // Add for each human chip
        } else if (this.field[row][column] == 1) {
            this.game.winningArrayCPU.push([row, column]);
            computerPoints++; // Add for each computer chip
        }

        // Moving through our board
        row += delta_y;
        column += delta_x;
    }

    // Marking winning/returning score
    if (humanPoints == 4) {
        this.game.winningArray = this.game.winningArrayHuman;
        // Computer won (100000)
        return -this.game.score;
    } else if (computerPoints == 4) {
        this.game.winningArray = this.game.winningArrayCPU;
        // Human won (-100000)
        return this.game.score;
    } else {
        // Return normal points
        return computerPoints;
    }
}

/**
 * Returns the overall score for our board.
 *
 * @return {number}
 */
Board.prototype.score = function() {
    let points = 0;

    let verticalPoints = 0;
    let horizontalPoints = 0;
    let diagonal_points1 = 0;
    let diagonal_points2 = 0;

    // Board-size: 7x6 (height x width)
    // Array indices begin with 0
    // => e.g. height: 0, 1, 2, 3, 4, 5

    // Vertical points
    // Check each column for vertical score
    // 
    // Possible situations
    //  0  1  2  3  4  5  6
    // [x][ ][ ][ ][ ][ ][ ] 0
    // [x][x][ ][ ][ ][ ][ ] 1
    // [x][x][x][ ][ ][ ][ ] 2
    // [x][x][x][ ][ ][ ][ ] 3
    // [ ][x][x][ ][ ][ ][ ] 4
    // [ ][ ][x][ ][ ][ ][ ] 5
    for (let row = 0; row < this.game.rows - 3; row++) {
        // Für jede Column überprüfen
        for (let column = 0; column < this.game.columns; column++) {
            // Die Column bewerten und zu den Punkten hinzufügen
            let score = this.scorePosition(row, column, 1, 0);
            if (score == this.game.score) return this.game.score;
            if (score == -this.game.score) return -this.game.score;
            verticalPoints += score;
        }            
    }

    // Horizontal points
    // Check each row's score
    // 
    // Possible situations
    //  0  1  2  3  4  5  6
    // [x][x][x][x][ ][ ][ ] 0
    // [ ][x][x][x][x][ ][ ] 1
    // [ ][ ][x][x][x][x][ ] 2
    // [ ][ ][ ][x][x][x][x] 3
    // [ ][ ][ ][ ][ ][ ][ ] 4
    // [ ][ ][ ][ ][ ][ ][ ] 5
    for (let row = 0; row < this.game.rows; row++) {
        for (let column = 0; column < this.game.columns - 3; column++) { 
            let score = this.scorePosition(row, column, 0, 1);   
            if (score == this.game.score) return this.game.score;
            if (score == -this.game.score) return -this.game.score;
            horizontalPoints += score;
        } 
    }



    // Diagonal points 1 (left-bottom)
    //
    // Possible situation
    //  0  1  2  3  4  5  6
    // [x][ ][ ][ ][ ][ ][ ] 0
    // [ ][x][ ][ ][ ][ ][ ] 1
    // [ ][ ][x][ ][ ][ ][ ] 2
    // [ ][ ][ ][x][ ][ ][ ] 3
    // [ ][ ][ ][ ][ ][ ][ ] 4
    // [ ][ ][ ][ ][ ][ ][ ] 5
    for (let row = 0; row < this.game.rows - 3; row++) {
        for (let column = 0; column < this.game.columns - 3; column++) {
            let score = this.scorePosition(row, column, 1, 1);
            if (score == this.game.score) return this.game.score;
            if (score == -this.game.score) return -this.game.score;
            diagonal_points1 += score;
        }            
    }

    // Diagonal points 2 (right-bottom)
    //
    // Possible situation
    //  0  1  2  3  4  5  6
    // [ ][ ][ ][x][ ][ ][ ] 0
    // [ ][ ][x][ ][ ][ ][ ] 1
    // [ ][x][ ][ ][ ][ ][ ] 2
    // [x][ ][ ][ ][ ][ ][ ] 3
    // [ ][ ][ ][ ][ ][ ][ ] 4
    // [ ][ ][ ][ ][ ][ ][ ] 5
    for (let row = 3; row < this.game.rows; row++) {
        for (let column = 0; column <= this.game.columns - 4; column++) {
            let score = this.scorePosition(row, column, -1, +1);
            if (score == this.game.score) return this.game.score;
            if (score == -this.game.score) return -this.game.score;
            diagonal_points2 += score;
        }

    }

    points = horizontalPoints + verticalPoints + diagonal_points1 + diagonal_points2;
    return points;
}

Board.prototype.copy = function() {
    let newBoard = new Array();
    for (let i = 0; i < this.field.length; i++) {
        newBoard.push(this.field[i].slice());
    }
    return new Board(this.game, newBoard, this.player);
}

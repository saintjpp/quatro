function Board(game, field, player) {
    this.game = game
    this.field = field;
    this.player = player;
}

Board.prototype.isFinished = function(depth, score) {
    if (score == this.game.score ||
        score == -this.game.score || 
        depth == 0 || 
        this.isFull()) {
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
    if (this.field[0][column] == null && 
        column < this.game.columns && 
        column >= 0) {

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

Board.prototype.scorePosition = function(row, column, deltaY, deltaX) {
    let playerOnePoints = 0;
    let computerPoints = 0;

    this.game.winningArrayPlayerOne = [];
    this.game.winningArrayCPU = [];

    for (let i = 0; i < 4; i++) {
        if (this.field[row][column] == 0) {
            this.game.winningArrayPlayerOne.push([row, column]);
            playerOnePoints++;
        } else if (this.field[row][column] == 1) {
            this.game.winningArrayCPU.push([row, column]);
            computerPoints++;
        }

        row += deltaY;
        column += deltaX;
    }

    if (playerOnePoints == 4) {
        this.game.winningArray = this.game.winningArrayPlayerOne;

        return -this.game.score;
    } else if (computerPoints == 4) {
        this.game.winningArray = this.game.winningArrayCPU;

        return this.game.score;
    } else {
        return computerPoints;
    }
}

Board.prototype.score = function() {
    let verticalPoints = 0, horizontalPoints = 0, diagonalPointsL = 0, diagonalPointsR = 0, points = 0;

    for (let row = 0; row < this.game.rows - 3; row++) {
        for (let column = 0; column < this.game.columns; column++) {
            let score = this.scorePosition(row, column, 1, 0);
            if (score == this.game.score) {
                return this.game.score;
            } 
            if (score == -this.game.score) {
                return -this.game.score;
            } 
            verticalPoints += score;
        }            
    }

    for (let row = 0; row < this.game.rows; row++) {
        for (let column = 0; column < this.game.columns - 3; column++) { 
            let score = this.scorePosition(row, column, 0, 1);   
            if (score == this.game.score) {
                return this.game.score;
            } 
            if (score == -this.game.score) {
                return -this.game.score;
            } 
            horizontalPoints += score;
        } 
    }

    for (let row = 0; row < this.game.rows - 3; row++) {
        for (let column = 0; column < this.game.columns - 3; column++) {
            let score = this.scorePosition(row, column, 1, 1);
            if (score == this.game.score) {
                return this.game.score;
            } 
            if (score == -this.game.score) {
                return -this.game.score;
            } 
            diagonalPointsL += score;
        }            
    }

    for (let row = 3; row < this.game.rows; row++) {
        for (let column = 0; column <= this.game.columns - 4; column++) {
            let score = this.scorePosition(row, column, -1, +1);
            if (score == this.game.score) {
                return this.game.score;
            } 
            if (score == -this.game.score) {
                return -this.game.score;
            } 
            diagonalPointsR += score;
        }
    }

    points = horizontalPoints + verticalPoints + diagonalPointsL + diagonalPointsR;
    return points;
}

Board.prototype.copy = function() {
    let newBoard = new Array();

    for (let i = 0; i < this.field.length; i++) {
        newBoard.push(this.field[i].slice());
    }
    return new Board(this.game, newBoard, this.player);
}

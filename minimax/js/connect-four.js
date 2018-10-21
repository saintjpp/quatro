var tabs = {
    toggleConfig: function() {
        let elemDisplay = document.getElementById("standings");
    
        if (elemDisplay.style.display == "none") {
            document.getElementById("standings").setAttribute('style','display: inherit');
        }
        else {
            document.getElementById("standings").setAttribute('style','display: none');
        }
    },
    toggleInstructions: function() {
        let elemDisplay = document.getElementById("instructions");
        
        if (elemDisplay.style.display == "none") {
            document.getElementById("instructions").setAttribute('style','display: inherit');
        }
        else {
            document.getElementById("instructions").setAttribute('style','display: none');
        }
    },
    toggleBoard: function() {
        let elemDisplay = document.getElementById("containerBoard");
        
        if (elemDisplay.style.display == "none") {
            document.getElementById("containerBoard").setAttribute('style','display: inherit');
        }
        else {
            document.getElementById("containerBoard").setAttribute('style','display: none');
        }
    },
}

function Game() {
    this.rows = 6; // Height
    this.columns = 7; // Width
    this.depth = 4; // Search depth
    this.score = 100000, // Win/loss score
    this.round = 0; // 0: Human, 1: Computer
    this.winningArray = []; // Winning (chips) array
    this.playerWon = 0;
    this.computerWon = 0;
    this.draws = 0;
    this.isFinished = false;
    
    that = this;

    that.init();
}

let totalGames = 0;

Game.prototype.init = function() {
    // Generate 'real' board
    // Create 2-dimensional array
    var game_board = new Array(that.rows);
    for (var i = 0; i < game_board.length; i++) {
        game_board[i] = new Array(that.columns);

        for (var j = 0; j < game_board[i].length; j++) {
            game_board[i][j] = null;
        }
    }

    // Create from board object (see board.js)
    this.board = new Board(this, game_board, 0);

    // Generate visual board
    var game_board = "";
    for (var i = 0; i < that.rows; i++) {
        game_board += "<tr>";
        for (var j = 0; j < that.columns; j++) {
            game_board += "<td class='empty'></td>";
        }
        game_board += "</tr>";
    }

    document.getElementById('game_board').innerHTML = game_board;

    // Action listeners
    var td = document.getElementById('game_board').getElementsByTagName("td");

    for (var i = 0; i < td.length; i++) {
        if (td[i].addEventListener) {
            td[i].addEventListener('click', that.act, false);
        } else if (td[i].attachEvent) {
            td[i].attachEvent('click', that.act)
        }
    }

    that.isFinished = false;
}

Game.prototype.act = function(e) {
    let element = e.target || window.event.srcElement;

    if (that.round == 0) {
        that.place(element.cellIndex);
    }
    
    if (that.round == 1) {
        that.generateComputerDecision();
    } 
}

Game.prototype.place = function(column) {
    if (!that.isFinished) {
        for (let y = that.rows - 1; y >= 0; y--) {
            if (document.getElementById('game_board').rows[y].cells[column].className == 'empty') {
                if (that.round == 1) {
                    document.getElementById('game_board').rows[y].cells[column].className = 'coin cpu-coin';
                } else {
                    document.getElementById('game_board').rows[y].cells[column].className = 'coin human-coin';
                }
                break;
            }
        }

        if (!that.board.place(column)) {
            return alert("Movimento Inválido ! Coluna cheia");
        }

        that.round = that.switchRound(that.round);
        that.updateStatus();
    }
}

Game.prototype.generateComputerDecision = function() {
    if (that.board.score() != that.score && 
        that.board.score() != -that.score && 
        !that.board.isFull()) {
        let ai_move = that.maximizePlay(that.board, that.depth);
        that.place(ai_move[0]);
    }
}

/**
 * Algorithm
 * Minimax principle
 */
Game.prototype.maximizePlay = function(board, depth) {
    // Call score of our board
    let score = board.score();

    // Break
    if (board.isFinished(depth, score)) return [null, score];

    // Column, Score
    let max = [null, -99999];

    // For all possible moves
    for (let column = 0; column < that.columns; column++) {
        let newBoard = board.copy(); // Create new board

        if (newBoard.place(column)) {
            let nextMove = that.minimizePlay(newBoard, depth - 1); // Recursive calling

            // Evaluate new move
            if (max[0] == null || nextMove[1] > max[1]) {
                max[0] = column;
                max[1] = nextMove[1];
            }
        }
    }

    return max;
}

Game.prototype.minimizePlay = function(board, depth) {
    let score = board.score();

    if (board.isFinished(depth, score)) return [null, score];

    // Column, score
    let min = [null, 99999];

    for (let column = 0; column < that.columns; column++) {
        let newBoard = board.copy();

        if (newBoard.place(column)) {
            let nextMove = that.maximizePlay(newBoard, depth - 1);

            if (min[0] == null || nextMove[1] < min[1]) {
                min[0] = column;
                min[1] = nextMove[1];
            }

        }
    }
    return min;
}

Game.prototype.switchRound = function(round) {
    return !round;
}

Game.prototype.updateStatus = function() {
    if (that.board.score() == -that.score) {
        _playerWins();
    }

    if (that.board.score() == that.score) {
        _computerWins();
    }

    if (that.board.isFull()) {
        _tied();
    }

    _numberGames();
}

Game.prototype.markWin = function() {
    for (let i = 0; i < that.winningArray.length; i++) {
        let name = document.getElementById('game_board').rows[that.winningArray[i][0]].cells[that.winningArray[i][1]].className;
        document.getElementById('game_board').rows[that.winningArray[i][0]].cells[that.winningArray[i][1]].className = name + " win";
    }
}

Game.prototype.surrender = function() {
    _computerWins();
}

Game.prototype.restartGame = function() {
    if (confirm('Game is going to be restarted.\nAre you sure?')) {
        that.init();
    }
}

function _playerWins() {
    that.playerWon += 1;
    that.isFinished = true;
    that.markWin();
    document.getElementById('gamesPlayer').innerHTML = "Ganhos pelo jogador - " + that.playerWon;
    
    _numberGames();
    
    alert("Vitória!");
}

function _computerWins() {
    that.computerWon += 1;
    that.isFinished = true;
    that.markWin();
    document.getElementById('gamesComputer').innerHTML = "Ganhos pelo computador - " + that.computerWon;

    _numberGames();

    alert("Vitória para o computador!");
}

function _tied() {
    that.draws += 1;
    that.isFinished = true;
    document.getElementById('draws').innerHTML = "Empates - " + that.draws;

    _numberGames();

    alert("Tie!");
}

function _numberGames() {
    totalGames = that.computerWon + that.draws + that.playerWon;
    document.getElementById('games').innerHTML = "Jogos - " + totalGames;
}

/**
 * Start game
 */
function Start() {
    window.Game = new Game();
}

window.onload = function() {
    Start()
};

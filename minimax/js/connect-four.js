function toggleConfig() {
    var configDisplay = document.getElementById("standings");
    
    if (configDisplay.style.display == "none") {
        document.getElementById("standings").setAttribute('style','display: inherit');
    }
    else {
        document.getElementById("standings").setAttribute('style','display: none');
    }
}

function toggleInstructions() {
    var configDisplay = document.getElementById("instructions");
    
    if (configDisplay.style.display == "none") {
        document.getElementById("instructions").setAttribute('style','display: inherit');
    }
    else {
        document.getElementById("instructions").setAttribute('style','display: none');
    }
}

function Game() {
    this.rows = 6; // Height
    this.columns = 7; // Width
    this.depth = 4; // Search depth
    this.score = 100000, // Win/loss score
    this.round = 0; // 0: Human, 1: Computer
    this.winningArray = []; // Winning (chips) array
    this.iterations = 0; // Iteration count
    this.playerWon = 0;
    this.computerWon = 0;
    this.draws = 0;
    
    that = this;

    that.init();
}

var totalGames = 0;

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
}

/**
 * On-click event
 */
Game.prototype.act = function(e) {
    var element = e.target || window.event.srcElement;

    // Human round
    if (that.round == 0) that.place(element.cellIndex);
    
    // Computer round
    if (that.round == 1) that.generateComputerDecision();
}

Game.prototype.place = function(column) {
    // If not finished
    if (that.board.score() != that.score && that.board.score() != -that.score && !that.board.isFull()) {
        for (var y = that.rows - 1; y >= 0; y--) {
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
    if (that.board.score() != that.score && that.board.score() != -that.score && !that.board.isFull()) {
        that.iterations = 0; // Reset iteration count
        document.getElementById('loading').style.display = "block"; // Loading message

        // AI is thinking
        setTimeout(function() {
            // Debug time
            var startzeit = new Date().getTime();

            // Algorithm call
            var ai_move = that.maximizePlay(that.board, that.depth);

            var laufzeit = new Date().getTime() - startzeit;
            document.getElementById('ai-time').innerHTML = laufzeit.toFixed(2) + 'ms';

            // Place ai decision
            that.place(ai_move[0]);

            // Debug
            document.getElementById('ai-column').innerHTML = 'Column: ' + parseInt(ai_move[0] + 1);
            document.getElementById('ai-score').innerHTML = 'Score: ' + ai_move[1];
            document.getElementById('ai-iterations').innerHTML = that.iterations;

            document.getElementById('loading').style.display = "none"; // Remove loading message
        }, 100);
    }
}

/**
 * Algorithm
 * Minimax principle
 */
Game.prototype.maximizePlay = function(board, depth) {
    // Call score of our board
    var score = board.score();

    // Break
    if (board.isFinished(depth, score)) return [null, score];

    // Column, Score
    var max = [null, -99999];

    // For all possible moves
    for (var column = 0; column < that.columns; column++) {
        var newBoard = board.copy(); // Create new board

        if (newBoard.place(column)) {

            that.iterations++; // Debug

            var nextMove = that.minimizePlay(newBoard, depth - 1); // Recursive calling

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
    var score = board.score();

    if (board.isFinished(depth, score)) return [null, score];

    // Column, score
    var min = [null, 99999];

    for (var column = 0; column < that.columns; column++) {
        var newBoard = board.copy();

        if (newBoard.place(column)) {

            that.iterations++;

            var nextMove = that.maximizePlay(newBoard, depth - 1);

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
    // Human won
    if (that.board.score() == -that.score) {
        that.playerWon += 1;

        that.markWin();
        document.getElementById('gamesPlayer').innerHTML = "Ganhos pelo jogador - " + that.playerWon;

        alert("Vitória!");
    }

    // Computer won
    if (that.board.score() == that.score) {
        that.computerWon += 1;

        that.markWin();
        document.getElementById('gamesComputer').innerHTML = "Ganhos pelo computador - " + that.computerWon;

        alert("Vitória para o computador!");
    }

    // Tie
    if (that.board.isFull()) {
        that.draws += 1;

        document.getElementById('draws').innerHTML = "Empates - " + that.draws;

        alert("Tie!");
    }

    totalGames = that.computerWon + that.draws + that.playerWon;
    document.getElementById('games').innerHTML = "Jogos - " + totalGames;
}

Game.prototype.markWin = function() {
    document.getElementById('game_board').className = "finished";
    for (var i = 0; i < that.winningArray.length; i++) {
        var name = document.getElementById('game_board').rows[that.winningArray[i][0]].cells[that.winningArray[i][1]].className;
        document.getElementById('game_board').rows[that.winningArray[i][0]].cells[that.winningArray[i][1]].className = name + " win";
    }
}

Game.prototype.restartGame = function() {
    if (confirm('Game is going to be restarted.\nAre you sure?')) {
        that.init();
    }
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

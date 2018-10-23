var tabs = {
    _toggleStandings: function() {
        let standingsDisplay = document.getElementById("standings");
    
        if (standingsDisplay.style.display == "none") {
            standingsDisplay.setAttribute('style','display: inherit');
        }
        else {
            standingsDisplay.setAttribute('style','display: none');
        }
    },
    _toggleInstructions: function() {
        let instructionsDisplay = document.getElementById("instructions");
        
        if (instructionsDisplay.style.display == "none") {
            instructionsDisplay.setAttribute('style','display: inherit');
        }
        else {
            instructionsDisplay.setAttribute('style','display: none');
        }
    },
    _toggleBoard: function() {
        let boardDisplay = document.getElementById("containerBoard");
        let configDisplay = document.getElementById("configurations");
        let identificationDisplay = document.getElementById("identification");
        
        if (boardDisplay.style.display == "none") {
            configDisplay.setAttribute('style','display: none');
            identificationDisplay.setAttribute('style','display: none');
            boardDisplay.setAttribute('style','display: inherit');
        }
        else {
            boardDisplay.setAttribute('style','display: none');
        }
    },
    _toggleConfig: function() {
        let boardDisplay = document.getElementById("containerBoard");
        let configDisplay = document.getElementById("configurations");
        let identificationDisplay = document.getElementById("identification");
        
        if (configDisplay.style.display == "none") {
            boardDisplay.setAttribute('style','display: none');
            identificationDisplay.setAttribute('style','display: none');
            configDisplay.setAttribute('style','display: inherit');
        }
        else {
            configDisplay.setAttribute('style','display: none');
        }
    },
    _toggleIdentification: function() {
        let boardDisplay = document.getElementById("containerBoard");
        let configDisplay = document.getElementById("configurations");
        let identificationDisplay = document.getElementById("identification");
        
        if (identificationDisplay.style.display == "none") {
            boardDisplay.setAttribute('style','display: none');
            configDisplay.setAttribute('style','display: none');
            identificationDisplay.setAttribute('style','display: inherit');
        }
        else {
            identificationDisplay.setAttribute('style','display: none');
        }
    },
}

var standings = {
    _playerWins: function() {
        that.playerWon += 1;
        that.isFinished = true;
        document.getElementById('gamesPlayer').innerHTML = "Ganhos por " + that.firstPlayer + " - " + that.playerWon;
        
        standings._numberGames();
        
        alert("Vitória!");
    },
    _computerWins: function() {
        that.computerWon += 1;
        that.isFinished = true;
        document.getElementById('gamesComputer').innerHTML = "Ganhos por " + that.secondPlayer + " - " + that.computerWon;
        
        standings._numberGames();
        
        alert("Vitória para o computador!");
    },
    _tied: function() {
        that.draws += 1;
        that.isFinished = true;
        document.getElementById('draws').innerHTML = "Empates - " + that.draws;
    
        standings._numberGames();
    
        alert("Tie!");
    },
    _numberGames: function() {
        totalGames = that.computerWon + that.draws + that.playerWon;
        document.getElementById('games').innerHTML = "Jogos - " + totalGames;
    }
}

function _pickNames() {
    that.firstPlayer = document.getElementById('inputPlayerA').value;
    that.secondPlayer = document.getElementById('inputPlayerB').value;

    document.getElementById('gamesPlayer').innerHTML = "Ganhos por " + that.firstPlayer + " - " + that.playerWon;
    document.getElementById('gamesComputer').innerHTML = "Ganhos por " + that.secondPlayer + " - " + that.computerWon;
}

function Game() {
    this.rows = 6; // Height
    this.columns = 7; // Width
    this.depth = 3; // Search depth
    this.score = 100000, // Win/loss score
    this.round = 0; // 0: Human, 1: Computer
    this.winningArray = []; // Winning (chips) array
    this.playerWon = 0;
    this.computerWon = 0;
    this.draws = 0;
    this.isFinished = false;
    this.firstPlayer = "Jogador um";
    this.secondPlayer = "Computador";

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

Game.prototype.surrender = function() {
    if (!that.isFinished) {
        standings._computerWins();
    }
}

Game.prototype.restartGame = function() {
    if (confirm('Está certo que quer reiniciar o jogo ?.\n')) {
        that.init();
    }
}

Game.prototype.updateStatus = function() {
    if (that.board.score() == -that.score) {
        standings._playerWins();
    }
    else if (that.board.score() == that.score) {
        standings._computerWins();
    } 
    else if (that.board.isFull()) {
        standings._tied();
    }

    standings._numberGames();
}

function Start() {
    window.Game = new Game();
    document.getElementById('levelAI').innerHTML = "Nível da inteligência artificial (profundidade): " + that.depth;
    document.getElementById('boardDimensions').innerHTML = "Tamanho do Tabuleiro: " + that.columns + " x " + that.rows;
    
    let firstToStart;
    
    if (that.round) {
        firstToStart = "Computador";
    }
    else {
        firstToStart = "Jogador";
    }

    document.getElementById('firstToStart').innerHTML = "Primeiro a jogar: " + firstToStart;
}

window.onload = function() {
    Start()
};

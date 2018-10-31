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
        
        alert("Vitória para o " + that.firstPlayer + "!");
    },
    _computerWins: function() {
        that.computerWon += 1;
        that.isFinished = true;
        document.getElementById('gamesComputer').innerHTML = "Ganhos por " + that.secondPlayer + " - " + that.computerWon;
        
        standings._numberGames();
        
        alert("Vitória para o " + that.secondPlayer + "!");
    },
    _tied: function() {
        that.draws += 1;
        that.isFinished = true;
        document.getElementById('draws').innerHTML = "Empates - " + that.draws;
    
        standings._numberGames();
    
        alert("Empate!");
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
    document.getElementById('firstOption').innerHTML = that.firstPlayer;
    document.getElementById('secondOption').innerHTML = that.secondPlayer;
}

function _boardDimensions() {
    that.columns = parseInt(document.getElementById('boardDimensionsX').value);
    that.rows = parseInt(document.getElementById('boardDimensionsY').value); 
}

function Game() {
    this.columns = 7;
    this.rows = 6;
    this.depth = 4;
    this.score = 10000;
    this.round = 0;
    this.winningArray = [];
    this.playerWon = 0;
    this.computerWon = 0;
    this.draws = 0;
    this.isFinished = false;
    this.firstPlayer = "Jogador um";
    this.secondPlayer = "Computador";

    that = this;

    that.init();
}

function Start() {
    window.Game = new Game();
    document.getElementById('levelAI').innerHTML = "Nível da inteligência artificial (profundidade): " + that.depth;
}

let totalGames = 0;
let firstToStart = 0;

Game.prototype.init = function() {

    if (firstToStart == 1) {
        that.round = 1;
    }
    else that.round = 0;

    let gameBoard = new Array(that.rows);
    for (let i = 0; i < gameBoard.length; i++) {
        gameBoard[i] = new Array(that.columns);

        for (let j = 0; j < gameBoard[i].length; j++) {
            gameBoard[i][j] = null;
        }
    }

    this.board = new Board(this, gameBoard, 0);

    gameBoard = "";
    for (i = 0; i < that.rows; i++) {
        gameBoard += "<tr>";
        for (j = 0; j < that.columns; j++) {
            gameBoard += "<td class='empty'></td>";
        }
        gameBoard += "</tr>";
    }

    document.getElementById('game-board').innerHTML = gameBoard;

    let td = document.getElementById('game-board').getElementsByTagName("td");
    for (i = 0; i < td.length; i++) {
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
        that.computerPlaying();
    } 
}

Game.prototype.place = function(column) {
    if (!that.isFinished) {
        for (let y = that.rows - 1; y >= 0; y--) {
            let cellClass = document.getElementById('game-board').rows[y].cells[column];
            if (cellClass.className == 'empty') {
                if (that.round == 1) {
                    cellClass.className = 'coin cpu-coin';
                } else {
                    cellClass.className = 'coin player-one-coin';
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

Game.prototype.selectFirstToStart = function() {
    let selectElem = document.getElementById("selectBox");
    firstToStart = selectElem.options[selectElem.selectedIndex].value;
}

Game.prototype.computerPlaying = function() {
    if (that.board.score() != that.score && 
        that.board.score() != -that.score && 
        !that.board.isFull()) {
        let aiMove = that.maximizePlay(that.board, that.depth);
        that.place(aiMove[0]);
    }
}

Game.prototype.maximizePlay = function(board, depth) {
    let score = board.score();

    if (board.isFinished(depth, score)) {
        return [null, score];
    } 

    let max = [null, -99999];

    for (let column = 0; column < that.columns; column++) {
        let newBoard = board.copy();

        if (newBoard.place(column)) {
            let nextMove = that.minimizePlay(newBoard, depth - 1);

            if (max[0] == null || 
                nextMove[1] > max[1]) {
                max[0] = column;
                max[1] = nextMove[1];
            }
        }
    }
    return max;
}

Game.prototype.minimizePlay = function(board, depth) {
    let score = board.score();
    let min = [null, 9999];

    if (board.isFinished(depth, score)) {
        return [null, score];
    } 

    for (let column = 0; column < that.columns; column++) {
        let newBoard = board.copy();

        if (newBoard.place(column)) {
            let nextMove = that.maximizePlay(newBoard, depth - 1);

            if (min[0] == null || 
                nextMove[1] < min[1]) {
                min[0] = column;
                min[1] = nextMove[1];
            }

        }
    }
    return min;
}

Game.prototype.switchRound = function(round) {
    if (round == 0)
        return round = 1;
    else if (round == 1)
        return round = 0;
}

Game.prototype.surrender = function() {
    if (!that.isFinished) {
        standings._computerWins();
    }
}

Game.prototype.restartGame = function() {
    if (confirm('Está certo que quer reiniciar o jogo ?\n')) {
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

window.onload = function() {
    Start()
};

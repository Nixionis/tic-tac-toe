const domElements = (function (doc) {
    const playerButton = doc.querySelector('.player-button');
    const computerButton = doc.querySelector('.computer-button');
    const startButton = doc.querySelector('.start-button');
    const restartButton = doc.querySelector('.restart-button');
    const gameButtons = doc.querySelectorAll('.game-button');
    const gameBoard = doc.querySelector('.main-container');
    const resultText = doc.querySelector('.win-text');
    const menuDiv = doc.querySelector('.menu-btns');

    return {
        playerButton,
        computerButton,
        startButton,
        restartButton,
        gameButtons,
        gameBoard,
        resultText,
        menuDiv
    };
})(document);

const gameBoard = (function () {

    const cells = new Array(9);
    const combinations = [
        [0, 1, 2],
        [0, 4, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 4, 6],
        [2, 5, 8],
        [3, 4, 5],
        [6, 7, 8]
    ]

    const clearBoard = function () {
        for (let i = 0; i < cells.length; i++)
            cells[i] = undefined;
    }

    const setMark = function (cellIndex, mark) {
        cells[cellIndex] = mark;
    }

    const checkWinCombinations = function (firstPlayer) {

        let playerMark = firstPlayer ? 1 : 2;

        for (let i = 0; i < combinations.length; i++) {
            if (cells[combinations[i][0]] === playerMark &&
                cells[combinations[i][1]] === playerMark &&
                cells[combinations[i][2]] === playerMark) {
                return true;
            }
        }

        return false;
    }

    const getEmptyCells = function () {
        const emptyCells = [];

        for (let i = 0; i < cells.length; i++) {
            if (!cells[i]) {
                emptyCells.push(i);
            }
        }

        return [...emptyCells];
    }

    const getGameCells = function () {
        return [...cells];
    }

    return {
        clearBoard,
        setMark,
        checkWinCombinations,
        getGameCells,
        getEmptyCells
    }
})();

const aiController = (function () {
    const getRandomMove = function (gameCells) {
        return gameCells[Math.floor(Math.random() * gameCells.length)];
    }

    return {
        getRandomMove
    }
})();

const gameController = (function (gameBoard, dom, aiControl) {

    let vsPlayer = true;
    let firstPlayerTurn = true;
    let gamePause = false;

    let players = [];

    const createPlayer = (name, number) => {
        return { name, number };
    };

    const switchEnemy = function (enemyType) {
        vsPlayer = enemyType === 'player';

        return vsPlayer;
    }

    const initializeGame = function () {

        players = [];
        players.push(createPlayer('Player 1', 1));
        players.push(createPlayer(vsPlayer ? 'Player 2' : 'Computer', 2));

        gameBoard.clearBoard();
        dom.menuDiv.classList.add('hide-display');
        dom.restartButton.classList.remove('hide-display');
        dom.gameBoard.classList.remove('hide-display');

        dom.gameButtons.forEach((button, index) => gameCellClickEvent(button, index));
    }

    const resetGame = function () {
        gameBoard.clearBoard();
        dom.gameButtons.forEach(button => {
            button.innerHTML = '';
            button.classList.add('active-button');
        });

        dom.resultText.textContent = '';
        dom.resultText.classList.add('hide-display');

        gamePause = false;
        firstPlayerTurn = true;
    }

    function gameCellClickEvent(button, index) {
        button.addEventListener('click', () => {
            if (button.classList.contains('active-button') && !gamePause) {
                gameButtonDisable(button, index);
                checkWinAndTurn();
            }
        });
    }

    function gameButtonDisable(button, index) {
        placeMark(firstPlayerTurn, index);
        button.innerHTML = getPlayerImage(firstPlayerTurn);
        button.classList.remove('active-button');

    }

    function checkWinAndTurn() {
        const win = gameBoard.checkWinCombinations(firstPlayerTurn);
        firstPlayerTurn = !firstPlayerTurn;

        if (win) {
            gamePause = true;
            dom.resultText.textContent = players[!firstPlayerTurn ? 0 : 1].name + ' won!';
            dom.resultText.classList.remove('hide-display');
        } else if (gameBoard.getEmptyCells().length === 0) {
            gamePause = true;
            dom.resultText.textContent = 'Draw!';
            dom.resultText.classList.remove('hide-display');
        }

        if (!vsPlayer && !gamePause && !firstPlayerTurn) {
            getAiMove();
            firstPlayerTurn = true;
        }
    }

    function getAiMove() {
        const aiMoveCell = aiControl.getRandomMove(gameBoard.getEmptyCells());
        gameButtonDisable(dom.gameButtons[aiMoveCell], aiMoveCell);
        checkWinAndTurn();
    }

    function placeMark(firstPlayer, cellIndex) {
        gameBoard.setMark(cellIndex, firstPlayer ? 1 : 2);
    }

    function getPlayerImage(firstPlayer) {
        if (firstPlayer) {
            return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%" fill="var(--cross-color)"><g id="_01_align_center" data-name="01 align center"><polygon points="18.707 6.707 17.293 5.293 12 10.586 6.707 5.293 5.293 6.707 10.586 12 5.293 17.293 6.707 18.707 12 13.414 17.293 18.707 18.707 17.293 13.414 12 18.707 6.707"/></g></svg>`;
        } else {
            return `<svg xmlns="http://www.w3.org/2000/svg" id="Bold" viewBox="0 0 24 24" width="65%" height="65%" fill="var(--circle-color)"><path d="M12,0A12,12,0,1,0,24,12,12.013,12.013,0,0,0,12,0Zm0,21a9,9,0,1,1,9-9A9.01,9.01,0,0,1,12,21Z"/></svg>`;
        }
    }

    return {
        switchEnemy,
        initializeGame,
        resetGame
    }
})(gameBoard, domElements, aiController);

domElements.playerButton.addEventListener('click', () => {
    if (gameController.switchEnemy('player')) {
        domElements.playerButton.classList.add('selected');
        domElements.computerButton.classList.remove('selected');
    }
});

domElements.computerButton.addEventListener('click', () => {
    if (!gameController.switchEnemy('computer')) {
        domElements.playerButton.classList.remove('selected');
        domElements.computerButton.classList.add('selected');
    }
});

domElements.startButton.addEventListener('click', () => {
    gameController.initializeGame();
});

domElements.restartButton.addEventListener('click', () => {
    gameController.resetGame();
});
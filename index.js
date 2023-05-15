import {
    tileStatus,
    createBoard,
    markTile,
    revealTile,
    checkWin,
    checkLose,
} from "./minesweeper.js"



const title = document.createElement('h3');
title.className = 'title';
title.innerHTML = 'Minesweeper'
document.body.appendChild(title);

const game = document.createElement('div');
game.className = 'board';
document.body.appendChild(game);

const subtext = document.createElement('h5');
subtext.className = 'subtext';
subtext.innerHTML = 'Mines Left: <span data-mine-count></span>';
document.body.appendChild(subtext);

const reloadButton = document.createElement("button");
reloadButton.innerHTML = "Restart";
document.body.appendChild(reloadButton);
reloadButton.addEventListener("click", () => {
    location.reload();
});

const timerElement = document.createElement("div");
timerElement.className = 'timer'
document.body.appendChild(timerElement);

const clicksElement = document.createElement("div");
clicksElement.className = 'clicks'
document.body.appendChild(clicksElement);

const click = new Audio("mechanic-button.mp3");
const mark = new Audio("flag.mp3");
const explode = new Audio("explode.mp3")
const congrads = new Audio("win.mp3")

let seconds = 0;
let clicks = 0;

const intervalId = setInterval(() => {
    seconds += 0.1;
    timerElement.innerHTML = `Timer: ${seconds.toFixed(1)} sec`;
}, 100);

clicksElement.innerHTML = `Clicks: ${clicks}`;
document.addEventListener("click", () => {
    ++clicks;
    clicksElement.innerHTML = `Clicks: ${clicks}`;
});

function endGame() {
    clearInterval(intervalId);
}
let boardSize = 10
let numberOfMines = 10

const board = createBoard(boardSize, numberOfMines)
const boardElement = document.querySelector(".board")
const minesLeftText = document.querySelector("[data-mine-count]")
const messageText = document.querySelector(".subtext")

for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
        const tile = board[i][j];
        boardElement.append(tile.element);
        tile.element.addEventListener("click", () => {
            click.play();
            revealTile(board, tile);
            checkGameEnd();
        });
        tile.element.addEventListener("contextmenu", e => {
            e.preventDefault();
            mark.play();
            markTile(tile);
            listMinesLeft();
        });
    }
}
boardElement.style.setProperty("--size", boardSize)
minesLeftText.textContent = numberOfMines

function listMinesLeft() {
    const markedTilesCount = board.reduce((count, row) =>
        count + row.filter(tile => tile.status === tileStatus.MARKED).length
        , 0)

    minesLeftText.textContent = numberOfMines - markedTilesCount
}

function checkGameEnd() {
    const win = checkWin(board)
    const lose = checkLose(board)

    if (win || lose) {
        boardElement.addEventListener("click", stopProp, { capture: true })
        boardElement.addEventListener("contextmenu", stopProp, { capture: true })
        endGame()
    }

    if (win) {
        messageText.style.color = "green";
        congrads.play()
        messageText.textContent = "You Win!"
    }
    if (lose) {
        messageText.style.color = "red";
        explode.play()
        messageText.textContent = "You Lose"
        board.forEach(row => row.forEach(tile => {
            if (tile.status === tileStatus.MARKED) markTile(tile)
            if (tile.mine) revealTile(board, tile)
        }))
    }
}

function stopProp(e) {
    e.stopImmediatePropagation()
}

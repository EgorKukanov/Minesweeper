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

const boardSize = 10
const numberOfMines = 10

const board = createBoard(boardSize, numberOfMines)
const boardElement = document.querySelector(".board")
const minesLeftText = document.querySelector("[data-mine-count]")
const messageText = document.querySelector(".subtext")

for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
        const tile = board[i][j];
        boardElement.append(tile.element);
        tile.element.addEventListener("click", () => {
            revealTile(board, tile);
            checkGameEnd();
        });
        tile.element.addEventListener("contextmenu", e => {
            e.preventDefault();
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
    }

    if (win) {
        messageText.textContent = "You Win!"
    }
    if (lose) {
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

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

let seconds = 0;
let clicks = 0;
let score = 0;
let grade = "A+!";

const timerElement = document.createElement("div");
timerElement.className = 'timer'
document.body.appendChild(timerElement);

const intervalId = setInterval(() => {
    seconds += 0.1;
    timerElement.innerHTML = `Timer: ${seconds.toFixed(1)} sec`;
}, 100);

const clicksElement = document.createElement("div");
clicksElement.className = 'clicks'
document.body.appendChild(clicksElement);

const boardElement = document.querySelector(".board")

boardElement.addEventListener('click', function (event) {
    if (event.target.tagName === 'DIV') {
        ++clicks;
        clicksElement.innerHTML = `Clicks: ${clicks}`;
    }
});

const scoreElement = document.createElement("div");
scoreElement.className = 'score';
document.body.appendChild(scoreElement);
boardElement.addEventListener('click', function (event) {
    if (event.target.tagName === 'DIV') {
        score = Math.round(1000000 / (clicks * seconds));
    }
});

const gradeElement = document.createElement("div");
gradeElement.className = 'grade';
document.body.appendChild(gradeElement);

function endGame() {
    clearInterval(intervalId);
}

const reloadButton = document.createElement("button");
reloadButton.innerHTML = "Restart";
document.body.appendChild(reloadButton);
reloadButton.addEventListener("click", () => {
    location.reload();
});

const themeSwitcher = document.createElement("input");
themeSwitcher.type = "checkbox";
themeSwitcher.id = "theme-switcher";

const label = document.createElement("label");
label.appendChild(themeSwitcher);
label.appendChild(document.createTextNode("Dark mode"));

document.body.appendChild(label);

const body = document.body;

themeSwitcher.addEventListener("change", () => {
    if (themeSwitcher.checked) {
        body.classList.add("light-theme");
        label.childNodes[1].nodeValue = "Light mode";
    } else {
        body.classList.remove("light-theme");
        label.childNodes[1].nodeValue = "Dark mode";
    }
});

const click = new Audio("mechanic-button.mp3");
const mark = new Audio("flag.mp3");
const explode = new Audio("explode.mp3")
const congrads = new Audio("win.mp3")

let boardSize = 10
let numberOfMines = 10

const board = createBoard(boardSize, numberOfMines)
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
        var timer;
        tile.element.addEventListener("touchstart", e => {
            timer = setTimeout(function () {
                e.preventDefault();
                mark.play();
                markTile(tile);
                listMinesLeft();
            }, 500);
        }, false);
        tile.element.addEventListener('touchend', function (e) {
            clearTimeout(timer);
        }, false);

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

    if (score >= 4000) {
        grade = "A+!";
    }
    if (score >= 2000 && score <= 3999) {
        grade = "A";
    }
    if (score >= 1000 && score <= 1999) {
        grade = "B";
    }
    if (score >= 500 && score <= 999) {
        grade = "C";
    }
    if (score >= 100 && score <= 499) {
        grade = "D";
    }
    if (score >= 1 && score <= 99) {
        grade = "E";
    }

    if (win || lose) {
        boardElement.addEventListener("click", stopProp, { capture: true })
        boardElement.addEventListener("contextmenu", stopProp, { capture: true })
        endGame()
    }

    if (win) {
        messageText.style.color = "green";
        congrads.play();
        messageText.textContent = "You Win!";
        score = Math.round(1000000 / (clicks * seconds));
        scoreElement.innerHTML = `Score: ${score}`;
        gradeElement.innerHTML = `Grade: ${grade}`;

    }

    if (lose) {
        messageText.style.color = "red";
        explode.play()
        messageText.textContent = "You Lose"
        board.forEach(row => row.forEach(tile => {
            if (tile.status === tileStatus.MARKED) markTile(tile)
            if (tile.mine) revealTile(board, tile)
            score = 0
            grade = "-"
            scoreElement.innerHTML = `Score: ${score}`;
            gradeElement.innerHTML = `Grade: ${grade}`;
        }))
    }
}

function stopProp(e) {
    e.stopImmediatePropagation()
}

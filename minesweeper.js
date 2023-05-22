export const tileStatus = {
    HIDDEN: "hidden",
    MINE: "mine",
    NUMBER: "number",
    MARKED: "marked",
}

export function createBoard(boardSize, numberOfMines) {
    const board = []
    const minePositions = getMinePositions(boardSize, numberOfMines)

    for (let x = 0; x < boardSize; x++) {
        const row = []
        for (let y = 0; y < boardSize; y++) {
            const element = document.createElement("div")
            element.dataset.status = tileStatus.HIDDEN

            const tile = {
                element,
                x,
                y,
                mine: minePositions.some(positionMatch.bind(null, { x, y })),
                get status() {
                    return this.element.dataset.status
                },
                set status(value) {
                    this.element.dataset.status = value
                },
            }

            row.push(tile)
        }
        board.push(row)
    }

    return board
}

export function markTile(tile) {
    if (
        tile.status !== tileStatus.HIDDEN &&
        tile.status !== tileStatus.MARKED
    ) {
        return
    }

    if (tile.status === tileStatus.MARKED) {
        tile.status = tileStatus.HIDDEN
    } else {
        tile.status = tileStatus.MARKED
    }
}

export function revealTile(board, tile) {
    if (tile.status !== tileStatus.HIDDEN) {
        return
    }

    if (tile.mine) {
        tile.status = tileStatus.MINE
        return
    }

    tile.status = tileStatus.NUMBER
    const adjacentTiles = nearbyTiles(board, tile)
    const mines = adjacentTiles.filter(t => t.mine)
    if (mines.length === 0) {
        adjacentTiles.forEach(revealTile.bind(null, board))
    } else {
        tile.element.textContent = mines.length
    }
}

export function checkWin(board) {
    return board.every(row => {
        return row.every(tile => {
            return (
                tile.status === tileStatus.NUMBER ||
                (tile.mine &&
                    (tile.status === tileStatus.HIDDEN ||
                        tile.status === tileStatus.MARKED))
            )
        })
    })
}

export function checkLose(board) {
    return board.some(row => {
        return row.some(tile => {
            return tile.status === tileStatus.MINE
        })
    })
}

function getMinePositions(boardSize, numberOfMines) {
    const positions = []

    while (positions.length < numberOfMines) {
        const position = {
            x: randomNumber(boardSize),
            y: randomNumber(boardSize),
        }

        if (!positions.some(positionMatch.bind(null, position))) {
            positions.push(position)
        }
    }

    return positions
}

function positionMatch(a, b) {
    return a.x === b.x && a.y === b.y
}

function randomNumber(size) {
    return Math.floor(Math.random() * size)
}

function nearbyTiles(board, { x, y }) {
    const tiles = []

    for (let xOffset = -1; xOffset <= 1; xOffset++) {
        for (let yOffset = -1; yOffset <= 1; yOffset++) {
            const tile = board[x + xOffset]?.[y + yOffset]
            if (tile) tiles.push(tile)
        }
    }

    return tiles
}
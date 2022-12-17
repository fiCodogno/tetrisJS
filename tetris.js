class Tetris {
    constructor(imageX, imageY, template) {
        this.imageX = imageX;
        this.imageY = imageY;
        this.template = template;
        this.x = squareCountX / 2;
        this.y = 0;
    }

    checkBottom() {
        for (let i = 0; i < this.template.length; i++) {
            for (let j = 0; j < this.template.length; j++) {
                if (this.template[i][j] == 0) continue;
                let realX = i + this.getTruncedPosition().x;
                let realY = j + this.getTruncedPosition().y;
                if (realY + 1 >= squareCountY) {
                    return false;
                }
                if (gameMap[realY + 1][realX].imageX != -1) {
                    return false;
                }
            }
        }
        return true;
    }

    getTruncedPosition() {
        return { x: Math.trunc(this.x), y: Math.trunc(this.y) };
    }

    checkLeft() {
        for (let i = 0; i < this.template.length; i++) {
            for (let j = 0; j < this.template.length; j++) {
                if (this.template[i][j] == 0) continue;
                let realX = i + this.getTruncedPosition().x;
                let realY = j + this.getTruncedPosition().y;
                if (realX - 1 < 0) {
                    return false;
                }
                if (gameMap[realY][realX].imageX != -1) {
                    return false;
                }
            }
        }
        return true;
    }

    checkRight() {
        for (let i = 0; i < this.template.length; i++) {
            for (let j = 0; j < this.template.length; j++) {
                if (this.template[i][j] == 0) continue;
                let realX = i + this.getTruncedPosition().x;
                let realY = j + this.getTruncedPosition().y;
                if (realX + 1 >= squareCountX) {
                    return false;
                }
                if (gameMap[realY][realX].imageX != -1) {
                    return false;
                }
            }
        }
        return true;
    }

    moveLeft() {
        if (this.checkLeft()) {
            this.x -= 1;
        }
    }

    moveRight() {
        if (this.checkRight()) {
            this.x += 1;
        }
    }

    moveBottom() {
        if (this.checkBottom()) {
            this.y += 1;
            score += 1;
        }
    }

    changeRotation() {
        let tempTemplate = [];
        for (let i = 0; i < this.template.length; i++) {
            tempTemplate[i] = this.template[i].slice();
        }
        let n = this.template.length;
        for (let layer = 0; layer < n / 2; layer++) {
            let first = layer;
            let last = n - 1 - layer;
            for (let i = first; i < last; i++) {
                let offset = i - first;
                let top = this.template[first][i];
                this.template[first][i] = this.template[i][last];
                this.template[i][last] = this.template[last][last - offset];
                this.template[last][last - offset] = this.template[last - offset][first];
                this.template[last - offset][first] = top;
            }
        }
        for (let i = 0; i < this.template.length; i++) {
            for (let j = 0; j < this.template.length; j++) {
                if (this.template[i][j] == 0) continue;
                let realX = i + this.getTruncedPosition().x;
                let realY = j + this.getTruncedPosition().y;
                if (realX < 0 || realX >= squareCountX ||
                    realY < 0 || realY >= squareCountY) {
                    this.template = tempTemplate;
                    return false;
                }
            }
        }
    }
}

const imageSquareSize = 24;
const size = 40;
const fps = 24;
const gameSpeed = 5;
const canvas = document.getElementById("canvas");
const nextShapeCanvas = document.getElementById("nextShapeCanvas");
const scoreCanvas = document.getElementById("scoreCanvas");
const squares = document.getElementById("squares");
const canvasContext = canvas.getContext("2d");
const nextShapeCanvasContext = nextShapeCanvas.getContext("2d");
const scoreCanvasContext = scoreCanvas.getContext("2d");
const squareCountX = canvas.width / size;
const squareCountY = canvas.height / size;
const shapes = [
    new Tetris(0, 120, [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0],
    ]),
    new Tetris(0, 96, [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
    ]),
    new Tetris(0, 72, [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1],
    ]),
    new Tetris(0, 48, [
        [0, 0, 0],
        [0, 1, 1],
        [1, 1, 0],
    ]),
    new Tetris(0, 24, [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
    ]),
    new Tetris(0, 0, [
        [1, 1],
        [1, 1],
    ]),
    new Tetris(0, 48, [
        [0, 0, 0],
        [1, 1, 0],
        [0, 1, 1],
    ]),
];

let gameMap;
let gameOver;
let currentShape;
let nextShape;
let score;
let initialTwoDArr;
let whiteLineThickness = 4;

let gameLoop = () => {
    setInterval(update, 1000 / gameSpeed);
    setInterval(draw, 1000 / fps);
};

let deleteCompleteRows = () => {
    for(let i = 0; i < gameMap.length; i++){
        let t = gameMap[i];
        let isComplete = true;
        for(let j = 0; j < t.length; j++){
            if(t[j].imageX == -1){
                isComplete = false;
            }
        }
        if(isComplete){
            score += 1000;
            for(let k = i; k > 0; k--){
                gameMap[k] = gameMap[k - 1];
            }
            let temp = [];
            for(let j = 0; j < squareCountX; j++){
                temp.push({imageX: -1, imageY: -1});
            }
            gameMap[0] = temp;
        }
    }
};

let update = () => {
    if (gameOver) return;
    if (currentShape.checkBottom()) {
        currentShape.y += 1;
    } else {
        for (let k = 0; k < currentShape.template.length; k++) {
            for (let l = 0; l < currentShape.template.length; l++) {
                if (currentShape.template[k][l] == 0) continue;
                gameMap[currentShape.getTruncedPosition().y + l]
                [currentShape.getTruncedPosition().x + k] = { imageX: currentShape.imageX, imageY: currentShape.imageY }
            }
        }
        deleteCompleteRows();
        currentShape = nextShape;
        nextShape = getRandomShape();
        if(!currentShape.checkBottom()){
            gameOver = true;
        }
        score += 100;
    }
};

let drawRect = (x, y, width, height, color) => {
    canvasContext.fillStyle = color;
    canvasContext.fillRect(x, y, width, height);
};

let drawBackground = () => {
    drawRect(0, 0, canvas.width, canvas.height, "#BCA0DC");
    for (let i = 0; i < squareCountX + 1; i++) {
        drawRect(
            size * i - whiteLineThickness,
            0,
            whiteLineThickness,
            canvas.height,
            "#FFFFFF"
        );
    }
    for (let j = 0; j < squareCountY + 1; j++) {
        drawRect(
            0,
            size * j - whiteLineThickness,
            canvas.width,
            whiteLineThickness,
            "#FFFFFF"
        );
    }
};

let drawSquares = () => {
    for (let i = 0; i < gameMap.length; i++) {
        let t = gameMap[i];
        for (let j = 0; j < t.length; j++) {
            if (t[j].imageX == -1) continue;
            canvasContext.drawImage(
                squares,
                t[j].imageX,
                t[j].imageY,
                imageSquareSize,
                imageSquareSize,
                j * size,
                i * size,
                size,
                size
            );
        }
    }
};

let drawCurrentTetris = () => {
    for (let i = 0; i < currentShape.template.length; i++) {
        for (let j = 0; j < currentShape.template.length; j++) {
            if (currentShape.template[i][j] == 0) continue;
            canvasContext.drawImage(
                squares,
                currentShape.imageX,
                currentShape.imageY,
                imageSquareSize,
                imageSquareSize,
                Math.trunc(currentShape.x) * size + size * i,
                Math.trunc(currentShape.y) * size + size * j,
                size,
                size
            );
        }
    }
};

let drawNextShape = () => {
    nextShapeCanvasContext.fillStyle = "#BCA0DC";
    nextShapeCanvasContext.fillRect(0, 0, nextShapeCanvas.width, nextShapeCanvas.height);
    for(let i = 0; i < nextShape.template.length; i++){
        for(let j = 0; j < nextShape.template.length; j++){
            if(nextShape.template[i][j] == 0) continue;
            nextShapeCanvasContext.drawImage(
                squares,
                nextShape.imageX,
                nextShape.imageY,
                imageSquareSize,
                imageSquareSize,
                i * size,
                j * size + size,
                size,
                size
            );
        }
    }
};

let drawGameOver = () => {
    canvasContext.font = "70px Arial";
    canvasContext.fillStyle = "#000000";
    canvasContext.fillText("Game Over!", 10, canvas.height / 2);
};

let drawScore = () => {
    scoreCanvasContext.clearRect(0, 0, scoreCanvas.width, scoreCanvas.height);
    scoreCanvasContext.font = "70px Arial";
    scoreCanvasContext.fillStyle = "#FF0000";
    scoreCanvasContext.fillText(score, 10, 50);
};

let draw = () => {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawSquares();
    drawCurrentTetris();
    drawNextShape();
    drawScore();
    if (gameOver) {
        drawGameOver();
    }
};

let getRandomShape = () => {
    return Object.create(shapes[Math.floor(Math.random() * shapes.length)]);
};
let resetVars = () => {
    initialTwoDArr = []
    for (let i = 0; i < squareCountY; i++) {
        let temp = [];
        for (let j = 0; j < squareCountX; j++) {
            temp.push({ imageX: -1, imageY: -1 });
        }
        initialTwoDArr.push(temp);
    }
    score = 0;
    gameOver = false;
    currentShape = getRandomShape();
    nextShape = getRandomShape();
    gameMap = initialTwoDArr;
};

window.addEventListener("keydown", (event) => {
    if (event.key == "ArrowLeft") {
        currentShape.moveLeft();
    } else if (event.key == "ArrowUp") {
        currentShape.changeRotation();
    } else if (event.key == "ArrowRight") {
        currentShape.moveRight();
    } else if (event.key == "ArrowDown") {
        currentShape.moveBottom();
    }
});

resetVars();
gameLoop();
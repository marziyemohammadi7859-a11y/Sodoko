
const SIZE = 6;
const BOX_ROWS = 2;
const BOX_COLS = 3;

const boardElement = document.getElementById("sudoku-board");
const numberButtons = document.getElementById("number-buttons");
const startButton = document.getElementById("start-btn");
const endButton = document.getElementById("end-btn");
const messageElement = document.getElementById("message");
const statusElement = document.getElementById("status");
const starsElement = document.getElementById("stars");

let solution = [];
let puzzle = [];
let selectedCell = null;
let gameRunning = false;
let mistakes = 0;

// ساخت جدول حل‌شده با اعداد ۱ تا ۶
function createSolution() {
    const numbers = [1, 2, 3, 4, 5, 6];

    // جابه‌جایی تصادفی اعداد
    shuffle(numbers);

    const rowOrder = shuffle([0, 1, 2, 3, 4, 5]);

    const colOrder = shuffle([0, 1, 2, 3, 4, 5]);

    // این الگو یک جدول معتبر سودوکو می‌سازد.
    return rowOrder.map(row =>
        colOrder.map(col =>
            numbers[(row * BOX_COLS + Math.floor(row / BOX_ROWS) + col) % SIZE]
        )
    );
}

// به‌هم‌ریختن ترتیب آرایه
function shuffle(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

// ساخت جدول بازی
function createPuzzle() {
    solution = createSolution();

    puzzle = solution.map(row => [...row]);

    // تعدادی از خانه‌ها خالی می‌شوند.
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (Math.random() < 0.58) {
                puzzle[r][c] = 0;
            }
        }
    }
}

// رسم جدول
function renderBoard() {
    boardElement.innerHTML = "";

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const cell = document.createElement("button");

            cell.className = "cell";
            cell.dataset.row = r;
            cell.dataset.col = c;

            if (puzzle[r][c] !== 0) {
                cell.textContent = toPersian(puzzle[r][c]);
                cell.classList.add("fixed");
                cell.disabled = true;
            } else {
                cell.textContent = "";

                cell.addEventListener("click", () => {
                    selectCell(r, c);
                });
            }

            cell.setAttribute(
                "aria-label",
                `سطر ${r + 1}، ستون ${c + 1}`
            );

            boardElement.appendChild(cell);
        }
    }
}

// تبدیل اعداد انگلیسی به فارسی
function toPersian(number) {
    return String(number).replace(/\d/g, digit =>
        "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]
    );
}

// انتخاب خانه خالی
function selectCell(row, col) {
    if (!gameRunning || puzzle[row][col] !== 0) {
        return;
    }

    selectedCell = { row, col };

    updateBoardHighlight();

    messageElement.textContent =
        "حالا یک عدد انتخاب کن! 🌟";
}

// مشخص کردن سطر و ستون انتخاب‌شده
function updateBoardHighlight() {
    const cells = boardElement.querySelectorAll(".cell");

    cells.forEach(cell => {
        cell.classList.remove("selected", "related");

        if (!selectedCell) {
            return;
        }

        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);

        if (
            row === selectedCell.row ||
            col === selectedCell.col
        ) {
            cell.classList.add("related");
        }

        if (
            row === selectedCell.row &&
            col === selectedCell.col
        ) {
            cell.classList.remove("related");
            cell.classList.add("selected");
        }
    });
}

// بررسی معتبر بودن عدد
function isValidMove(row, col, number) {
    // بررسی سطر
    for (let c = 0; c < SIZE; c++) {
        if (c !== col && puzzle[row][c] === number) {
            return false;
        }
    }

    // بررسی ستون
    for (let r = 0; r < SIZE; r++) {
        if (r !== row && puzzle[r][col] === number) {
            return false;
        }
    }

    // بررسی پنجره ۲ در ۳
    const startRow = Math.floor(row / BOX_ROWS) * BOX_ROWS;
    const startCol = Math.floor(col / BOX_COLS) * BOX_COLS;

    for (let r = startRow; r < startRow + BOX_ROWS; r++) {
        for (let c = startCol; c < startCol + BOX_COLS; c++) {
            if (
                (r !== row || c !== col) &&
                puzzle[r][c] === number
            ) {
                return false;
            }
        }
    }

    return true;
}

// قرار دادن عدد در خانه
function enterNumber(number) {
    if (!gameRunning || !selectedCell) {
        messageElement.textContent =
            "اول یک خانه خالی را انتخاب کن! 😊";
        return;
    }

    const { row, col } = selectedCell;

    if (number === 0) {
        puzzle[row][col] = 0;

        renderBoard();
        updateBoardHighlight();

        messageElement.textContent =
            "خانه پاک شد. دوباره امتحان کن! 🧹";

        return;
    }

    if (!isValidMove(row, col, number)) {
        mistakes++;

        messageElement.textContent =
            "اوه! این عدد تکراری است. یک عدد دیگر امتحان کن! 💪";

        starsElement.textContent =
            mistakes < 3 ? "⭐ ⭐ ⭐" :
            mistakes < 6 ? "⭐ ⭐" : "⭐";

        return;
    }

    puzzle[row][col] = number;

    renderBoard();
    updateBoardHighlight();

    if (isBoardComplete()) {
        finishGame(true);
    } else {
        messageElement.textContent =
            "آفرین! این حرکت درست بود! 🌈";
    }
}

// بررسی تکمیل جدول
function isBoardComplete() {
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (puzzle[r][c] === 0) {
                return false;
            }

            if (puzzle[r][c] !== solution[r][c]) {
                return false;
            }
        }
    }

    return true;
}

// فعال یا غیرفعال کردن دکمه‌های اعداد
function setNumberButtonsEnabled(enabled) {
    numberButtons.querySelectorAll("button").forEach(button => {
        button.disabled = !enabled;
    });
}

// شروع بازی
function startGame() {
    createPuzzle();

    selectedCell = null;
    mistakes = 0;
    gameRunning = true;

    renderBoard();

    startButton.disabled = true;
    endButton.disabled = false;

    setNumberButtonsEnabled(true);

    starsElement.textContent = "⭐ ⭐ ⭐";

    statusElement.textContent = "بازی شروع شد!";

    messageElement.textContent =
        "یک خانه خالی انتخاب کن و بازی را شروع کن! 🎉";
}

// پایان بازی
function endGame() {
    if (!gameRunning) {
        return;
    }

    finishGame(false);
}

// پایان بازی یا اعلام پیروزی
function finishGame(won) {
    gameRunning = false;
    selectedCell = null;

    startButton.disabled = false;
    endButton.disabled = true;

    setNumberButtonsEnabled(false);

    if (won) {
        statusElement.textContent = "برنده شدی!";

        messageElement.textContent =
            "🎉 آفرین قهرمان! تو سودوکو را حل کردی! 🏆";

        starsElement.textContent = "🌟 ⭐ 🌟";
    } else {
        statusElement.textContent = "بازی تمام شد!";

        messageElement.textContent =
            "آفرین که تلاش کردی! برای بازی دوباره روی شروع بزن. 💜";
    }
}

// کلیک روی دکمه‌های اعداد
numberButtons.addEventListener("click", event => {
    const button = event.target.closest("button");

    if (!button || button.disabled) {
        return;
    }

    const number = Number(button.dataset.number);

    enterNumber(number);
});

// دکمه شروع و پایان
startButton.addEventListener("click", startGame);
endButton.addEventListener("click", endGame);

// وضعیت اولیه بازی
renderBoard();

setNumberButtonsEnabled(false);
endButton.disabled = true;

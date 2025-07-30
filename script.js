const symbolScreen = document.getElementById("symbol-screen");
const difficultyScreen = document.getElementById("difficulty-screen");
const nextBtn = document.getElementById("nextBtn");
const easyBtn = document.querySelector(".easy");
const hardBtn = document.querySelector(".hard");
const xBtn = document.querySelector(".playerX");
const oBtn = document.querySelector(".playerO");
const startBtn = document.querySelector(".startBtn");
const playBoard = document.querySelector(".play-board");
const players = document.querySelector(".players");
const allBox = document.querySelectorAll(".play-area span");
const resultBox = document.querySelector(".result-box");
const wonText = document.querySelector(".won-text");
const replayBtn = document.querySelector(".btn button");
const userScoreEl = document.getElementById("userScore");
const botScoreEl = document.getElementById("botScore");
const tieScoreEl = document.getElementById("tieScore");

let difficulty = "easy",
    playerSign = "X",
    playerXIcon = "fas fa-times",
    playerOIcon = "far fa-circle",
    runBot = true,
    userScore = localStorage.getItem("userScore") || 0,
    botScore = localStorage.getItem("botScore") || 0,
    tieScore = localStorage.getItem("tieScore") || 0;

userScoreEl.textContent = userScore;
botScoreEl.textContent = botScore;
tieScoreEl.textContent = tieScore;

xBtn.onclick = () => {
  playerSign = "X";
  players.classList.remove("player");
  xBtn.classList.add("active");
  oBtn.classList.remove("active");
};

oBtn.onclick = () => {
  playerSign = "O";
  players.classList.add("player");
  oBtn.classList.add("active");
  xBtn.classList.remove("active");
};

nextBtn.onclick = () => {
  if (!xBtn.classList.contains("active") && !oBtn.classList.contains("active")) {
    alert("Please select X or O first.");
    return;
  }
  symbolScreen.classList.remove("active");
  difficultyScreen.classList.add("active");
};

easyBtn.onclick = () => {
  difficulty = "easy";
  easyBtn.classList.add("active");
  hardBtn.classList.remove("active");
};

hardBtn.onclick = () => {
  difficulty = "hard";
  hardBtn.classList.add("active");
  easyBtn.classList.remove("active");
};

startBtn.onclick = () => {
  if (!easyBtn.classList.contains("active") && !hardBtn.classList.contains("active")) {
    alert("Please select a difficulty level.");
    return;
  }
  difficultyScreen.classList.remove("active");
  playBoard.classList.add("show");
};

window.onload = () => {
  allBox.forEach(box => box.addEventListener("click", () => clickedBox(box)));
};

function clickedBox(element) {
  let currentSign = playerSign;
  let icon = currentSign === "X" ? playerXIcon : playerOIcon;
  let color = currentSign === "X" ? "red" : "blue";
  element.innerHTML = `<i class="${icon}" style="color: ${color};"></i>`;
  element.setAttribute("id", currentSign);
  element.style.pointerEvents = "none";
  playBoard.style.pointerEvents = "none";
  selectWinner(currentSign);
  setTimeout(() => bot(), Math.floor(Math.random() * 800) + 200);
}

function bot() {
  if (!runBot) return;
  const empty = [...allBox].filter(b => !b.childElementCount);
  if (empty.length === 0) return;

  let box;
  if (difficulty === "easy") {
    box = empty[Math.floor(Math.random() * empty.length)];
  } else if (difficulty === "hard") {
    let bestMove = getBestMove();
    box = document.querySelector(".box" + bestMove);
  }

  playerSign = playerSign === "X" ? "O" : "X";
  let currentSign = playerSign;
  let icon = currentSign === "X" ? playerXIcon : playerOIcon;
  let color = currentSign === "X" ? "red" : "blue";
  box.innerHTML = `<i class="${icon}" style="color: ${color};"></i>`;
  box.setAttribute("id", currentSign);
  box.style.pointerEvents = "none";
  selectWinner(currentSign);
  playBoard.style.pointerEvents = "auto";
  playerSign = playerSign === "X" ? "O" : "X";
}

function getIdVal(num) {
  return document.querySelector(".box" + num).id;
}

function checkWin(a, b, c, sign) {
  return getIdVal(a) === sign && getIdVal(b) === sign && getIdVal(c) === sign;
}

function selectWinner(currentPlayer) {
  const combos = [[1,2,3],[4,5,6],[7,8,9],[1,4,7],[2,5,8],[3,6,9],[1,5,9],[3,5,7]];
  let win = combos.some(c => checkWin(...c, currentPlayer));
  if (win) {
    runBot = false;
    setTimeout(() => {
      resultBox.classList.add("show");
      playBoard.classList.remove("show");
      wonText.innerHTML = `Player <span style="color: ${currentPlayer === "X" ? "red" : "blue"};">${currentPlayer}</span> won the game!`;
      updateScore(currentPlayer);
    }, 700);
  } else if ([...allBox].every(box => box.id)) {
    runBot = false;
    setTimeout(() => {
      resultBox.classList.add("show");
      playBoard.classList.remove("show");
      wonText.textContent = "Match has been drawn!";
      updateScore("draw");
    }, 700);
  }
}

function updateScore(winner) {
  if (winner === "draw") {
    tieScore++;
    tieScoreEl.textContent = tieScore;
    localStorage.setItem("tieScore", tieScore);
  } else if (
    (winner === "X" && players.classList.contains("player")) ||
    (winner === "O" && !players.classList.contains("player"))
  ) {
    botScore++;
    botScoreEl.textContent = botScore;
    localStorage.setItem("botScore", botScore);
  } else {
    userScore++;
    userScoreEl.textContent = userScore;
    localStorage.setItem("userScore", userScore);
  }
}

function getBoardState() {
  return [...allBox].map((box, i) => box.id || i + 1);
}

function getBestMove() {
  const isBotX = (players.classList.contains("player") && playerSign === "O") || (!players.classList.contains("player") && playerSign === "X");
  const botSign = isBotX ? "X" : "O";
  const humanSign = botSign === "X" ? "O" : "X";
  let board = getBoardState();

  function minimax(newBoard, depth, isMaximizing) {
    const combos = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    const winner = (() => {
      for (let [a, b, c] of combos) {
        if (newBoard[a] === newBoard[b] && newBoard[b] === newBoard[c]) {
          return newBoard[a];
        }
      }
      return null;
    })();

    if (winner === botSign) return 10 - depth;
    if (winner === humanSign) return depth - 10;
    if (newBoard.every(cell => typeof cell === "string")) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      newBoard.forEach((cell, i) => {
        if (typeof cell === "number") {
          newBoard[i] = botSign;
          bestScore = Math.max(bestScore, minimax(newBoard, depth + 1, false));
          newBoard[i] = i + 1;
        }
      });
      return bestScore;
    } else {
      let bestScore = Infinity;
      newBoard.forEach((cell, i) => {
        if (typeof cell === "number") {
          newBoard[i] = humanSign;
          bestScore = Math.min(bestScore, minimax(newBoard, depth + 1, true));
          newBoard[i] = i + 1;
        }
      });
      return bestScore;
    }
  }

  let bestMove, bestScore = -Infinity;
  board.forEach((cell, i) => {
    if (typeof cell === "number") {
      board[i] = botSign;
      let score = minimax(board, 0, false);
      board[i] = i + 1;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i + 1;
      }
    }
  });
  return bestMove;
}

replayBtn.onclick = () => location.reload();

const symbols = ["A", "B", "C", "D"];

let gameBoard, flippedCards, matchedPairs;
const gameObjects = {
  selectors: {
    restart: document.getElementById("restartButton"),
    board: document.getElementById("gameBoard"),
  },
  errorMessages: {
    domError: "gameBoard element not found in the DOM!",
  },
  winMessages: {
    win: "You win!",
  },

  constants: {
    flip: "flipped",
    match: "matched",
  },
};

const restart = gameObjects.selectors.restart;

function initializeGame() {
  gameBoard = gameObjects.selectors.board;
  if (!gameBoard) {
    throw new error(gameObjects.errorMessages.domError);
  }

  gameBoard.innerHTML = "";
  flippedCards = [];
  matchedPairs = 0;

  restart.disabled = true;

  const cards = shuffle([...symbols, ...symbols]);
  cards.forEach((symbol, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.symbol = symbol;
    card.dataset.index = index;
    card.addEventListener("click", onCardClick);
    gameBoard.appendChild(card);
  });
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function onCardClick(e) {
  const card = e.target;
  if (
    card.classList.contains(gameObjects.constants.flip) ||
    card.classList.contains(gameObjects.constants.match)
  )
    return;

  card.classList.add(gameObjects.constants.flip);
  card.textContent = card.dataset.symbol;
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    checkMatch();
  }

  if (flippedCards.length === 0) {
    restart.disabled = false;
  }
}

function checkMatch() {
  const [first, second] = flippedCards;
  if (first.dataset.symbol === second.dataset.symbol) {
    first.classList.add(gameObjects.constants.match);
    second.classList.add(gameObjects.constants.match);
    matchedPairs++;
    checkWin();
  } else {
    setTimeout(() => {
      first.classList.remove(gameObjects.constants.flip);
      second.classList.remove(gameObjects.constants.flip);
      first.textContent = "";
      second.textContent = "";
    }, 1000);
  }
  flippedCards = [];
}

function checkWin() {
  if (matchedPairs === symbols.length) {
    setTimeout(() => {
      alert(gameObjects.winMessages.win);
    }, 1000);
  }
}

document.addEventListener("DOMContentLoaded", initializeGame);
restart.addEventListener("click", initializeGame);

module.exports = {
  initializeGame,
  onCardClick,
  checkWin,
  shuffle,
  gameObjects,
};

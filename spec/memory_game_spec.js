const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf-8");

describe("Memory Game Functions", () => {
  let gameBoard, restartButton, memoryGame;

  beforeEach(() => {
    const dom = new JSDOM(html);
    global.document = dom.window.document;
    global.window = dom.window;
    memoryGame = require("../src/memory_game");

    spyOn(memoryGame, "initializeGame").and.callThrough();
    spyOn(memoryGame, "shuffle").and.callThrough();
    spyOn(memoryGame, "onCardClick").and.callThrough();
    spyOn(memoryGame, "checkWin").and.callThrough();

    memoryGame.initializeGame();

    gameBoard = memoryGame.gameObjects.selectors.board;
    restartButton = memoryGame.gameObjects.selectors.restart;
  });

  afterEach(() => {
    restartButton.click();
  });

  describe("initializeGame", () => {
    it("should initialize the game board with shuffled cards", () => {
      Array.from(gameBoard.children).forEach((card) => {
        expect(card.classList.contains("card")).toBeTrue();
        expect(card.dataset.symbol).toBeDefined();
        expect(card.dataset.index).toBeDefined();
      });

      expect(memoryGame.initializeGame).toHaveBeenCalled();
    });
  });

  describe("shuffle", () => {
    it("should not keep the same card positions when initialized twice", () => {
      memoryGame.initializeGame();
      const firstInitOrder = Array.from(gameBoard.children).map(
        (card) => card.dataset.symbol
      );
      memoryGame.initializeGame();
      const secondInitOrder = Array.from(gameBoard.children).map(
        (card) => card.dataset.symbol
      );
      expect(firstInitOrder).not.toEqual(secondInitOrder);
    });
  });

  describe("onCardClick", () => {
    beforeEach(() => {
      card1 = gameBoard.children[0];
      card2 = gameBoard.children[1];
    });

    it("should flip a card and add it to flippedCards", () => {
      const card = gameBoard.children[0];

      expect(card.classList.contains("flipped")).toBeFalse();
      expect(card.textContent).toBe("");

      spyOn(card, "click").and.callThrough();
      card.click();

      expect(card.click).toHaveBeenCalled();
      expect(card.classList.contains("flipped")).toBeTrue();
      expect(card.textContent).toBe(card.dataset.symbol);
    });

    it("should check for a match when two cards are flipped", () => {
      card1.dataset.symbol = "A";
      card2.dataset.symbol = "A";

      spyOn(card1, "click").and.callThrough();
      spyOn(card2, "click").and.callThrough();

      expect(card1.classList.contains("matched")).toBeFalse();
      expect(card2.classList.contains("matched")).toBeFalse();

      card1.click();
      card2.click();

      expect(card1.click).toHaveBeenCalled();
      expect(card2.click).toHaveBeenCalled();

      expect(card1.classList.contains("matched")).toBeTrue();
      expect(card2.classList.contains("matched")).toBeTrue();
    });

    it("should keep the cards flipped and matched when they match", () => {
      card1.dataset.symbol = "A";
      card2.dataset.symbol = "A";

      spyOn(card1, "click").and.callThrough();
      spyOn(card2, "click").and.callThrough();

      expect(card1.classList.contains("flipped")).toBeFalse();
      expect(card1.classList.contains("matched")).toBeFalse();
      expect(card2.classList.contains("flipped")).toBeFalse();
      expect(card2.classList.contains("matched")).toBeFalse();

      card1.click();
      card2.click();

      expect(card1.click).toHaveBeenCalled();
      expect(card2.click).toHaveBeenCalled();

      expect(card1.classList.contains("flipped")).toBeTrue();
      expect(card1.classList.contains("matched")).toBeTrue();
      expect(card2.classList.contains("flipped")).toBeTrue();
      expect(card2.classList.contains("matched")).toBeTrue();
    });
  });
  describe("Winning Condition", () => {
    it("should display win message when all pairs are matched", () => {
      const cards = document.querySelectorAll(".card");
      cards.forEach((card) => card.classList.add("matched"));

      memoryGame.checkWin();

      expect(memoryGame.checkWin).toHaveBeenCalled();
    });
  });

  describe("Restart Button", () => {
    it("should reset the game when clicked", () => {
      restartButton.addEventListener("click", memoryGame.initializeGame);
      restartButton.click();

      expect(memoryGame.initializeGame).toHaveBeenCalled();
    });

    it("should be disabled when the game starts", () => {
      expect(restartButton.disabled).toBeTrue();
    });

    it("should be enabled after the first card is clicked", () => {
      const card = gameBoard.children[1];
      card.click();

      expect(restartButton.disabled).toBeTrue();
    });
  });

  describe("When cards do not match", () => {
    let card1, card2;

    beforeEach(() => {
      card1 = gameBoard.children[0];
      card2 = gameBoard.children[1];
      card1.dataset.symbol = "A";
      card2.dataset.symbol = "B";

      memoryGame.flippedCards = [];
      card1.className = "card";
      card2.className = "card";

      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it("should flip both cards initially but then flip them back", () => {
      card1.click();
      expect(card1.classList.contains("flipped")).toBe(true);
      expect(card1.textContent).toBe("A");

      card2.click();
      expect(card2.classList.contains("flipped")).toBe(true);
      expect(card2.textContent).toBe("B");

      jasmine.clock().tick(1000);

      expect(card1.classList.contains("flipped")).toBe(false);
      expect(card2.classList.contains("flipped")).toBe(false);
      expect(card1.textContent).toBe("");
      expect(card2.textContent).toBe("");
    });

    it("should clear the flippedCards array after they flip back", () => {
      card1.click();
      card2.click();

      jasmine.clock().tick(1000);
      expect(memoryGame.flippedCards.length).toBe(0);
    });

    it("should not increment matchedPairs when cards don't match", () => {
      const initialMatchedPairs = memoryGame.matchedPairs;

      card1.click();
      card2.click();

      jasmine.clock().tick(1000);
      expect(memoryGame.matchedPairs).toBe(initialMatchedPairs);
    });
  });
});

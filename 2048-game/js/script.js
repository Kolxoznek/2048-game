import { Grid } from "./grid.js";
import { Tile } from "./tile.js";

const gameBoard = document.getElementById("game-board");
const resetBtn = document.querySelector(".reset-btn");
const scoreElement = document.querySelector(".score span");
const scoreLeaders = document.querySelectorAll(".leaders__list-item");
let score = 0;
let final = false;
let popupOpened = false;

const grid = new Grid(gameBoard);
grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));
grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));
setupInputOnce();
updateScore();
setLocalScore();
renderScoreLeaders();


function setupInputOnce() {
  window.addEventListener("keydown", handleInput, { once: true, capture: true });
}

resetBtn.addEventListener("click", restartGame);

async function handleInput(event) {
  if (popupOpened) {
    return;
  }
  switch (event.key) {
    case "ArrowUp":
      if (!canMoveUp()) {
        setupInputOnce();
        return;
      }
      await moveUp();
      break;
    case "ArrowDown":
      if (!canMoveDown()) {
        setupInputOnce();
        return;
      }
      await moveDown();
      break;
    case "ArrowLeft":
      if (!canMoveLeft()) {
        setupInputOnce();
        return;
      }
      await moveLeft();
      break;
    case "ArrowRight":
      if (!canMoveRight()) {
        setupInputOnce();
        return;
      }
      await moveRight();
      break;
    default:
      setupInputOnce();
      return;
  }

  const newTile = new Tile(gameBoard);
  grid.getRandomEmptyCell().linkTile(newTile);

  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    await newTile.waitForAnimationEnd();
    showPopup('lose');
    setLocalScore();
    renderScoreLeaders();
    return;
  }
  if (grid.has2048() && !final) {
    showPopup('win');
    final = true;
  }

  setupInputOnce();
}

async function moveUp() {
  await slideTiles(grid.cellsGroupedByColumn);
}

async function moveDown() {
  await slideTiles(grid.cellsGroupedByReversedColumn);
}

async function moveLeft() {
  await slideTiles(grid.cellsGroupedByRow);
}

async function moveRight() {
  await slideTiles(grid.cellsGroupedByReversedRow);
}

async function slideTiles(groupedCells) {
  const promises = [];

  groupedCells.forEach(group => slideTilesInGroup(group, promises));

  await Promise.all(promises);
  grid.cells.forEach(cell => { 
    if (cell.hasTileForMerge()) {
      cell.mergeTiles()
      updateScore(cell.linkedTile.value / 2);
    }
  });
}

function slideTilesInGroup(group, promises) {
  for (let i = 1; i < group.length; i++) {
    if (group[i].isEmpty()) {
      continue;
    }

    const cellWithTile = group[i];

    let targetCell;
    let j = i - 1;
    while (j >= 0 && group[j].canAccept(cellWithTile.linkedTile)) {
      targetCell = group[j];
      j--;
    }

    if (!targetCell) {
      continue;
    }

    promises.push(cellWithTile.linkedTile.waitForTransitionEnd());

    if (targetCell.isEmpty()) {
      targetCell.linkTile(cellWithTile.linkedTile);
    } else {
      targetCell.linkTileForMerge(cellWithTile.linkedTile);
    }

    cellWithTile.unlinkTile();
  }
}

function canMoveUp() {
  return canMove(grid.cellsGroupedByColumn);
}

function canMoveDown() {
  return canMove(grid.cellsGroupedByReversedColumn);
}

function canMoveLeft() {
  return canMove(grid.cellsGroupedByRow);
}

function canMoveRight() {
  return canMove(grid.cellsGroupedByReversedRow);
}

function canMove(groupedCells) {
  return groupedCells.some(group => canMoveInGroup(group));
}

function canMoveInGroup(group) {
  return group.some((cell, index) => {
    if (index === 0) {
      return false;
    }

    if (cell.isEmpty()) {
      return false;
    }

    const targetCell = group[index - 1];
    return targetCell.canAccept(cell.linkedTile);
  });
}

function showPopup(key) {
  popupOpened = true;
  const popup = document.createElement("div");
  popup.classList.add("popup");
  popup.id = 'popup';
  if (key === 'win') {
    popup.innerHTML = `
    <h2 class="popup__title">You won!</h2>
    <h3 class="popup__subtitle">Tile 2048 received, ${score} points earned</h3>
    <div class="popup__btns">
        <button class="continue-btn btn" id="popup-continue-btn">Continue</button>
        <button class="reset-btn btn" id="popup-reset-btn">Reset game</button>
    </div>
    `
    popup.querySelector('#popup-continue-btn').addEventListener('click', removePopup);
  } else {
    popup.innerHTML = `
    <h2 class="popup__title">Game over!</h2>
    <h3 class="popup__subtitle">${score} points earned</h3>
    <div class="popup__btns">
    <button class="reset-btn btn" id="popup-reset-btn">Reset game</button>
    </div>
    `
  }
  document.body.append(popup);
  popup.querySelector('#popup-reset-btn').addEventListener('click', restartGame);
}

function removePopup() {
  popupOpened = false;
  const popup = document.querySelector("#popup");
  if (popup) {
    popup.remove();
  }
  setLocalScore();
  renderScoreLeaders();
  setupInputOnce();
}

function restartGame() {
  removePopup();
  grid.cells.forEach(cell => {
    if (!cell.isEmpty()) {
      cell.linkedTile.removeFromDOM();
      cell.unlinkTile();
    }
  });
  
  grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));
  grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));
  score = 0;
  final = false;
  updateScore();
}

function updateScore(value = 0) {
  score += value;
  scoreElement.textContent = score;
}


function setLocalScore() {
  if (!getLocalScore()) {
    localStorage.setItem("score", JSON.stringify(new Array(10).fill(0)));
  }
  const arr = getLocalScore()
  arr.push(score);
  arr.sort((a, b) => b - a);
  arr.splice(10);
  localStorage.setItem("score", JSON.stringify(arr));
  return arr;
}

function getLocalScore() {
  return JSON.parse(localStorage.getItem("score"));
}

function renderScoreLeaders() {
  const arr = getLocalScore();
  scoreLeaders.forEach(item => {
    item.textContent = arr.shift();
  })
}
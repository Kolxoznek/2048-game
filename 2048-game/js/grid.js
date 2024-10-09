import { Cell } from "./cell.js";

const gridSize = 4;
const cellsCount = gridSize ** 2;

export function Grid(gridElement) {
    this.cells = [];

    for (let i = 0; i < cellsCount; i++) {
        this.cells.push(
            new Cell(gridElement, i % gridSize, Math.floor(i / gridSize))
        );
    }

    this.getRandomEmptyCell = function() {
        const emptyCells = this.cells.filter(cell => cell.isEmpty());
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        return emptyCells[randomIndex];
    }
}
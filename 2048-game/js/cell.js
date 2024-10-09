export function Cell(gridElement, x, y) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    gridElement.append(cell);
    this.x = x;
    this.y = y;

    this.linkTile = function(tile) {
        tile.setXY(this.x, this.y);
        this.linkedTile = tile;
    }

    this.isEmpty = function() {
        return !this.linkedTile;
    }
}
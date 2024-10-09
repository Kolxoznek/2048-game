export function Tile(gridElement) {
    this.tileElement = document.createElement('div');
    this.tileElement.classList.add('tile');
    this.value = Math.random() > 0.8 ? 4 : 2;
    this.tileElement.textContent = this.value;
    gridElement.append(this.tileElement);

    this.setXY = function(x, y) {
        this.x = x;
        this.y = y;
        this.tileElement.style.setProperty('--x', x);
        this.tileElement.style.setProperty('--y', y);
    }
}
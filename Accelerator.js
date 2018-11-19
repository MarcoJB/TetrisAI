function Accelerator() {
    this.renderGPU = new GPU();

    this.render = this.renderGPU.createKernel(function(tiles, currentTetriminiPosition, currentTetriminiConfiguration) {
        const real_y = this.constants.gamesPerCol * this.constants.gameHeight * this.constants.tileSize - this.thread.y;
        const col = Math.floor(this.thread.x / (this.constants.gameWidth * this.constants.tileSize));
        const row = Math.floor(real_y / (this.constants.gameHeight * this.constants.tileSize));
        const game = row * this.constants.gamesPerRow + col;
        const offset_x = col * this.constants.gameWidth * this.constants.tileSize;
        const offset_y = row * this.constants.gameHeight * this.constants.tileSize;
        const tile_y = Math.floor((real_y - offset_y) / this.constants.tileSize);
        const tile_x = Math.floor((this.thread.x - offset_x) / this.constants.tileSize);
        const tetrimino_x = Math.floor(tile_x - currentTetriminiPosition[game][1]);
        const tetrimino_y = Math.floor(tile_y - currentTetriminiPosition[game][0]);

        if (tiles[game][tile_y][tile_x] === 1) {
            this.color(0, 0, 0);
        } else if (tetrimino_x >= 0
            && tetrimino_x < 4
            && tetrimino_y >= 0
            && tetrimino_y < 4
            && currentTetriminiConfiguration[game][tetrimino_y][tetrimino_x] === 1) {
            this.color(1, 0, 0);
        } else {
            this.color(1, 1, 1);
        }
    }, {
        constants: {
            tileSize: Site.gameSettings.tileSize,
            gameWidth: Site.gameSettings.size.x,
            gameHeight: Site.gameSettings.size.y,
            gamesPerRow: Site.gamesPerRow,
            gamesPerCol: Site.gamesPerCol
        },
        output: [
            Site.gameSettings.size.x * Site.gameSettings.tileSize * Site.gamesPerRow,
            Site.gameSettings.size.y * Site.gameSettings.tileSize * Site.gamesPerCol
        ],
        graphical: true
    })
}
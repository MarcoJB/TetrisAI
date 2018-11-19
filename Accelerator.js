function Accelerator() {
    this.renderGPU = new GPU();

    this.render = this.renderGPU.createKernel(function(tiles, currentTetriminiPosition, currentTetriminiConfiguration) {
        const real_y = this.constants.gamesPerCol * this.constants.gameHeight - this.thread.y;
        const col = Math.floor(this.thread.x / this.constants.gameWidth);
        const row = Math.floor(real_y / this.constants.gameHeight);
        const game = row * this.constants.gamesPerRow + col;
        const offset_x = col * this.constants.gameWidth;
        const offset_y = row * this.constants.gameHeight;
        const tile_y = real_y - offset_y;
        const tile_x = this.thread.x - offset_x;
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
            gameWidth: Site.gameSettings.size.x,
            gameHeight: Site.gameSettings.size.y,
            gamesPerRow: Site.gamesPerRow,
            gamesPerCol: Site.gamesPerCol
        },
        output: [
            Site.gameSettings.size.x * Site.gamesPerRow,
            Site.gameSettings.size.y * Site.gamesPerCol
        ],
        graphical: true
    })
}
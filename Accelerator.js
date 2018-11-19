function Accelerator() {
    this.renderGPU = new GPU();

    this.render = this.renderGPU.createKernel(function(tiles) {
        if (tiles[Math.floor(this.thread.y / this.constants.tileSize)][Math.floor(this.thread.x / this.constants.tileSize)] === 1) {
            this.color(0, 0, 0);
        } else {
            this.color(1, 1, 1);
        }
    }, {
        constants: {
            tileSize: Site.gameSettings.tileSize
        },
        output: [Site.gameSettings.size.x * Site.gameSettings.tileSize, Site.gameSettings.size.y * Site.gameSettings.tileSize],
        graphical: true
    })
}
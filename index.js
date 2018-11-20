var Site = {
    sum: 0,
    canvas: null,
    ctx: null,
    accelerator: null,
    speed: 500,
    gameAmount: 100,
    games: [],
    endCounter: 0,
    level: 0,
    maxLevel: 5000,
    scores: [],
    doRender: true,
    gamesPerRow: 15,
    gamesPerCol: null,
    gameSettings: {
        size: {
            x: 12,
            y: 21
        },
        tileSize: 2.5,
        actionsPerStep: 20
    },
    init: function () {
        this.gamesPerCol = Math.ceil(this.gameAmount / this.gamesPerRow);

        this.accelerator = new Accelerator();

        this.canvas = document.querySelector('#games');
        this.canvas.width = this.gamesPerRow * this.gameSettings.size.x;
        this.canvas.height = this.gamesPerCol * this.gameSettings.size.y;
        this.canvas.style.width = this.gamesPerRow * this.gameSettings.size.x * this.gameSettings.tileSize;
        this.canvas.style.height = this.gamesPerCol * this.gameSettings.size.y * this.gameSettings.tileSize;
        this.ctx = this.canvas.getContext('2d');

        this.initGen();
    },
    initGen: function (preInitGames) {
        //document.querySelector('#games').innerText = '';

        if (preInitGames) {
            this.games = this.games.concat(preInitGames);
        }

        const preInitGameLength = preInitGames ? preInitGames.length : 0;
        for (var i = 0; i < this.gameAmount - preInitGameLength; i++) {
            const game = new Game();
            this.games.push(game);
        }

        this.start(500000);
    },
    start: function (speed) {
        this.speed = speed || 1;
        this.endCounter = 0;
        this.step();
    },
    step: function () {
        const that = this;

        for (var i = 0; i < this.games.length; i++) {
            this.games[i].performAction();
        }

        if (this.doRender) this.render();

        if (this.endCounter < this.games.length) {
            setTimeout(function () {
                that.step();
            }, 500 / this.speed);
        } else {
            const sortedScore = this.games.map(g => g.props.score).sort(((a, b) => b - a));
            const averageScore = sortedScore.reduce((pv, cv) => pv + cv, 0) / this.games.length;
            const halfAvgScore = sortedScore.slice(0, this.games.length / 2).reduce((pv, cv) => pv + cv, 0) / this.games.length * 2;
            this.sum += averageScore;
            this.scores.push({scores: sortedScore, averageScore});
            if (this.level === 0) {
                const statsText = `Generation ${this.level}: Highscore ${sortedScore[0]} - avg ${averageScore} - avg/2 ${halfAvgScore} (global avg: ${Math.round((this.sum / (1 + this.level)) * 100) / 100})`;
                console.warn(statsText);
                updateStats(statsText);
            } else {
                const deltaHighscore = Helper.displaySign(sortedScore[0] - this.scores[this.level - 1].scores[0]);
                const statsText = `Generation ${this.level}: Highscore ${sortedScore[0]} (${deltaHighscore}) - avg ${averageScore} - avg/2 ${halfAvgScore} (global avg: ${Math.round((this.sum / (1 + this.level)) * 100) / 100})`;
                console.warn(statsText);
                updateStats(statsText);
            }
            this.nextLevel();
        }
    },
    end: function () {
        this.endCounter++;
    },
    render: function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const tiles = [];
        const currentTetriminiPosition = [];
        const currentTetriminiConfiguration = [];

        for (var game of this.games) {
            tiles.push(game.props.tiles);

            if (game.props.currentTetrimino.type !== null) {
                currentTetriminiPosition.push(game.props.currentTetrimino.position);
                currentTetriminiConfiguration.push(tetrimini[game.props.currentTetrimino.type][game.props.currentTetrimino.rotationState]);
            } else {
                currentTetriminiPosition.push([0, 0]);
                currentTetriminiConfiguration.push([[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
            }
        }

        this.accelerator.render(tiles, currentTetriminiPosition, currentTetriminiConfiguration);
        this.ctx.drawImage(this.accelerator.render.getCanvas(), 0, 0);
    },
    nextLevel: function () {
        if (this.level <= this.maxLevel) {
            this.level++;
            const networkScores = this.games.map(g => {
                return {
                    score: g.props.score,
                    network: g.props.network
                };
            }).sort(((a, b) => b['score'] - a['score']));
            const partition = 8;
            const topNetworks = networkScores.slice(0, Math.round(this.games.length / partition)).map(g => g.network);
            this.games = [];
            this.endCounter = 0;

            const games = topNetworks.map(n => n.clone())
                .concat(topNetworks.slice(0, this.games.length / (partition * 4)).map(n => n.mutate(0.005)))
                .concat(topNetworks.slice(0, this.games.length / (partition * 4)).map(n => n.mutate(0.005)))
                .concat(topNetworks.slice(0, this.games.length / (partition * 4)).map(n => n.mutate(0.01)))
                .concat(topNetworks.slice(0, this.games.length / (partition * 4)).map(n => n.mutate(0.02)))
                .concat(topNetworks.map(n => n.mutate(0.01)))
                .concat(topNetworks.map(n => n.mutate(0.10)))
                .concat(topNetworks.map(n => n.mutate(0.25)))
                .map(n => new Game(n));

            this.initGen(games);
        }
    }
};

function updateStats(statsText) {
    const stats = document.querySelector('#stats');
    stats.innerHTML = `<p>${statsText}</p>`;
}

window.addEventListener('load', function () {
    Site.init();
});

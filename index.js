var Site = {
    canvas: null,
    ctx: null,
    accelerator: null,
    speed: 50,
    gameAmount: 100,
    games: [],
    endCounter: 0,
    level: 0,
    maxLevel: 500,
    scores: [],
    doRender: true,
    gamesPerRow: 10,
    gamesPerCol: null,
    gameSettings: {
        size: {
            x: 12,
            y: 21
        },
        tileSize: 10,
        actionsPerStep: 20
    },
    init: function() {
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

        this.start(500);
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
            setTimeout(function () {that.step();}, 500 / this.speed);
        } else {
            const sortedScore = this.games.map(g => g.props.score).sort(((a, b) => b - a));
            const averageScore = sortedScore.reduce((pv, cv) => pv + cv, 0) / this.games.length;
            this.scores.push({scores: sortedScore, averageScore});
            if (this.level === 0) {
                console.warn(`Generation ${this.level}: Highscore ${sortedScore[0]} - average score ${averageScore}`);
            } else {
                const deltaHighscore = Helper.displaySign(sortedScore[0] - this.scores[this.level - 1].scores[0]);
                const deltaAverage = Helper.displaySign(averageScore - this.scores[this.level - 1].averageScore);
                console.warn(`Generation ${this.level}: Highscore ${sortedScore[0]} (${deltaHighscore}) - average score ${averageScore} (${deltaAverage})`);
            }
            this.nextLevel();
        }
    },
    end: function () {
        this.endCounter++;
    },
    render: function() {
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
                currentTetriminiConfiguration.push([[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]);
            }
        }

        this.accelerator.render(tiles, currentTetriminiPosition, currentTetriminiConfiguration);
        this.ctx.drawImage(this.accelerator.render.getCanvas(), 0, 0);
    },
    nextLevel: function () {
        if (this.level <= this.maxLevel) {
            this.level++;
            const networkScores = this.games.map(g => {
                const n = {
                    score: g.props.score,
                    network: g.props.network
                };
                return n;
            }).sort(((a, b) => b['score'] - a['score']));
            const topNetworks = networkScores.slice(0, Math.round(this.games.length / 3)).map(g => g.network);
            this.games = [];
            this.endCounter = 0;

            const games = topNetworks.map(n=>n.clone()).concat(topNetworks.map(n => n.mutate(0.01))).map(n => new Game(n));

            this.initGen(games);
        }
    }
};

window.addEventListener('load', function () {
    Site.init();
});

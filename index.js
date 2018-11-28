var Site = {
        sum: 0,
        gen2sum: 0,
        canvas: null,
        ctx: null,
        accelerator: null,
        currentRandom: 0,
        speed: 500000,
        gameAmount: 400,
        games: [],
        endCounter: 0,
        level: 0,
        maxLevel: 5000,
        scores: [],
        highscores: [],
        doRender: true,
        belowAverage: 0,
        gamesPerRow: 40,
        gamesPerCol: null,
        gameSettings: {
            size: {
                x: 12,
                y: 21
            },
            tileSize: 1,
            actionsPerStep: 20
        },
        init: function () {
            this.gamesPerCol = Math.ceil(this.gameAmount / this.gamesPerRow);

            this.accelerator = new Accelerator();

            this.currentRandom = Math.random();

            this.canvas = document.querySelector('#games');
            this.canvas.width = this.gamesPerRow * this.gameSettings.size.x;
            this.canvas.height = this.gamesPerCol * this.gameSettings.size.y;
            this.canvas.style.width = this.gamesPerRow * this.gameSettings.size.x * this.gameSettings.tileSize;
            this.canvas.style.height = this.gamesPerCol * this.gameSettings.size.y * this.gameSettings.tileSize;
            this.ctx = this.canvas.getContext('2d');

            this.initGen();
        },
        initGen: function (preInitGames) {
            if (!!preInitGames) {
                this.games = preInitGames.slice(0, this.gameAmount * 0.75);
            }
            const gamesLength = this.games.length;
            for (var i = 0; i < this.gameAmount - gamesLength; i++) {
                this.games.push(new Game());
            }
            this.start();
        },
        start: function (speed) {
            this.speed = speed || this.speed;
            this.endCounter = 0;
            this.step();
        },
        step: function () {
            const that = this;

            for (var i = 0; i < this.games.length; i++) {
                this.games[i].performAction(this.currentRandom);
            }

            this.currentRandom = Math.random();

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
                const trainedNets = this.games.filter(g => g.props.network.props.generation > 3);
                const trainedNetsAvg = trainedNets.length === 0 ? 0 : trainedNetSum = trainedNets.reduce((sum, game) => sum + game.props.score, 0) / trainedNets.length;
                this.gen2sum += trainedNetsAvg;
                this.scores.push({
                    scores: sortedScore,
                    averageScore,
                    highScore: sortedScore[0],
                    averageTrained: trainedNetsAvg
                });
                const globalAverage = Math.round((this.sum / (1 + this.level)) * 100) / 100;
                const globalGen2Average = Math.round((this.gen2sum / (1 + this.level)) * 100) / 100;
                if (averageScore < globalAverage) {
                    this.belowAverage++
                } else {
                    this.belowAverage = 0
                }

                if (this.level === 0) {
                    const statsText = {
                        header: `Generation ${this.level}`,
                        text: `Highscore ${sortedScore[0]} - avg ${averageScore} - (global avg: ${globalAverage})`
                    };
                    console.warn(statsText);
                    updateStats(statsText);
                } else {
                    const deltaHighscore = Helper.displaySign(sortedScore[0] - this.scores[this.level - 1].scores[0]);
                    const statsText = {
                        header: `Generation ${this.level}`,
                        text: `Highscore ${sortedScore[0]} (${deltaHighscore}) - avg ${averageScore} - gen>2avg ${trainedNetsAvg} (global avg: ${globalAverage})`
                    };
                    console.warn(statsText);
                    updateStats(statsText);
                }
                drawStats(this.scores, globalAverage, globalGen2Average);
                this.manageProceeding();
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
        manageProceeding: function () {
            //if (this.level % (Math.round(Math.sqrt(Math.sqrt(this.level))) + 1) === 0) {
            if (this.level % 2 === 0) {
                this.games.forEach(g => g.props.score += g.props.scoreSum);
                this.nextLevel();
            } else {
                if (this.level < this.maxLevel) {
                    this.level++;
                    for (let i = 0; i < this.games.length; i++) {
                        const scoreSum = this.games[i].props.score + this.games[i].props.scoreSum;
                        const clearedLines = this.games[i].props.clearedLines;
                        this.games[i] = new Game(this.games[i].props.network.clone());
                        this.games[i].props.scoreSum = scoreSum;
                        this.games[i].props.clearedLines = clearedLines;
                    }
                    this.start(500000);
                }
            }
        },
        nextLevel: function () {
            this.level++;
            const networkScores = this.games.map(g => {
                return {
                    score: g.props.score,
                    network: g.props.network
                };
            }).sort(((a, b) => b['score'] - a['score']));
            const clearedNetworks = this.games.filter(g => g.props.clearedLines > 0).map(g => g.props.network);
            const partition = 10;
            const topNetworks = networkScores.slice(0, Math.round(this.gameAmount / partition)).map(g => g.network.clone());
            this.games = [];
            this.endCounter = 0;
            const games =
                topNetworks
                    .concat(topNetworks.map(n => n.mutate(0.001 * (1 + this.belowAverage))))
                    .concat(topNetworks.map(n => n.mutate(0.001 * (1 + this.belowAverage))))
                    .concat(topNetworks.map(n => n.mutate(0.001 * (1 + this.belowAverage))))
                    .concat(topNetworks.slice(0, this.games.length / (partition * 2)).map(n => n.mutate(0.02 * (1 + this.belowAverage))))
                    .concat(topNetworks.slice(this.games.length / (partition * 4), this.games.length * 2 / (partition * 4)).map(n => n.mutate(0.25 * (1 + this.belowAverage))))
                    .concat(topNetworks.slice(this.games.length / (partition * 4), this.games.length * 2 / (partition * 4)).map(n => n.mutate(0.1 * (1 + this.belowAverage))))
                    .concat(topNetworks.slice(0, this.games.length / (partition * 8)).map(n => n.mutate(0.125 * (1 + this.belowAverage))))
                    .concat(topNetworks.slice(0, this.games.length / (partition * 8)).map(n => n.mutate(0.175 * (1 + this.belowAverage))))
                    .concat(topNetworks.slice(0, this.games.length / (partition * 8)).map(n => n.mutate(0.15 * (1 + this.belowAverage))))
                    .concat(topNetworks.slice(0, this.games.length / (partition * 8)).map(n => n.mutate(0.25 * (1 + this.belowAverage))))
                    .concat(topNetworks.slice(0, this.games.length / (partition * 8)).map(n => n.mutate(0.3 * (1 + this.belowAverage))))
                    .concat(clearedNetworks.map(n => n.clone()))
                    .concat(clearedNetworks.map(n => n.mutate(0.1)))
                    .concat(clearedNetworks.map(n => n.mutate(0.15)))
                    .concat(clearedNetworks.map(n => n.mutate(0.2)))
                    .concat(clearedNetworks.map(n => n.mutate(0.05)))
                    .map(n => new Game(n));
            this.initGen(games);
        }
    }
;

function concatIfNotEmpty(arr1, arr2) {
    if (!arr1 && !Array.isArray(arr1)) throw new Error("arr1 has to be an array");
    if (!!arr2 && Array.isArray(arr2)) {
        return arr1.concat(arr2);
    }
    return arr1;
}

function updateStats(statsText) {
    const stats = document.querySelector('#stats');
    stats.innerHTML = `<h3>${statsText.header}</h3><p>${statsText.text}</p>`;
}

window.addEventListener('load', function () {
    Site.init();
});

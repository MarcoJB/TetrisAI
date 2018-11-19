var Site = {
    speed: 50,
    gameAmount: 50,
    games: [],
    endCounter: 0,
    level: 0,
    maxLevel: 500,
    scores: [],
    init: function (preInitGames) {
        const preInitGameLength = preInitGames ? preInitGames.length : 0;
        for (var i = 0; i < this.gameAmount - preInitGameLength; i++) {
            const game = new Game();
            this.games.push(game);
            document.querySelector('#games').appendChild(game.props.canvas);
        }
        this.games.concat(preInitGames);
        this.start();
    },
    start: function (speed) {
        this.speed = speed || 1;
        this.endCounter = 0;
        this.step();
        window.scrollTo(0, document.body.scrollHeight);
    },
    step: function () {
        const that = this;

        for (var i = 0; i < this.gameAmount; i++) {
            this.games[i].performAction();
        }

        if (this.endCounter < this.games.length) {
            setTimeout(function () {
                that.step();
            }, 5);
        } else {
            const sortedScore = this.games.map(g => g.props.score).sort(((a, b) => b - a));
            const averageScore = sortedScore.reduce((pv, cv) => pv + cv, 0) / this.gameAmount;
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

    nextLevel: function () {
        if (this.level <= this.maxLevel) {
            this.level++;
            this.games = [];
            this.endCounter = 0;
            const networkScores = this.games.map(g => {
                return {
                    score: g.props.score,
                    network: g.props.network
                }
            }).sort(((a, b) => b['score'] - a['score']));
            const topNetworks = networkScores.slice(0, 24).map(g => g.network);
            this.init(topNetworks.map(n => {
                n.mutate();
                return n
            }));
        }
    }
};

window.addEventListener('load', function () {
    Site.init();
});

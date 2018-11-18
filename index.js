var Site = {
    speed: 1,
    gameAmount: 50,
    games: [],
    endCounter: 0,
    init: function() {
        for (var i = 0; i < this.gameAmount; i++) {
            const game = new Game();
            this.games.push(game);
            document.querySelector('#games').appendChild(game.props.canvas);
        }
        this.start();
    },
    start: function(speed) {
        this.speed = speed || 1;
        this.endCounter = 0;
        this.step();
    },
    step: function() {
        const that = this;

        for (var i = 0; i < this.gameAmount; i++) {
            this.games[i].performAction();
        }

        if (this.endCounter < this.games.length) setTimeout(function() {
            that.step();
        }, 5)
    },
    end: function(game) {
        this.endCounter++;
    }
};



window.addEventListener('load', function() {
    Site.init();
});
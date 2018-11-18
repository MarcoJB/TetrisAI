var Game = {
    ctx: null,
    tiles: [],
    size: {
        x: 12,
        y: 21
    },
    active: false,
    paused: false,
    speed: 1,
    currentTetrimino: {
        type: null,
        position: [null, null],
        rotationState: null
    },
    timeout: null,
    skip: false,
    score: 0,
    actionsPerStep: 20,
    init: function() {
        var that = this;

        var canvas = document.querySelector('#game');
        canvas.width = this.size.x * 10;
        canvas.height = this.size.y * 10;
        this.ctx = canvas.getContext('2d');

        for (var y = 0; y < this.size.y; y++) {
            this.tiles[y] = [];

            for (var x = 0; x < this.size.x; x++) {
                this.tiles[y][x] = x === 0 || x === 11 || y === 20;
            }
        }

        window.addEventListener('keydown', function(e) {
            that.handleKeyEvent(e.key);
        });

        this.neuralNetwork.init();
    },
    neuralNetwork: {
        network: null,
        init: function() {
            this.network = new NeuralNetwork((Game.size.x - 2) * (Game.size.y - 1), 20, 6);
        },
        getNetworkReaction: function() {
            let input_vector = [];
            let y;

            for (y = 0; y < Game.size.y - 1; y++) {
                input_vector = input_vector.concat(Game.tiles[y].slice(1, Game.size.x - 1));
            }

            for (y = 0; y < 4; y++) {
                for (var x = 0; x < 4; x++) {
                    if (tetrimini[Game.currentTetrimino.type][Game.currentTetrimino.rotationState][y][x]) {
                        input_vector[(Game.currentTetrimino.position[0] + y) * (Game.size.x - 2) + Game.currentTetrimino.position[1] + x] = true;
                    }
                }
            }

            return this.network.calc(input_vector);
        }
    },
    handleKeyEvent: function(key) {
        const that = this;

        switch (key) {
            case "ArrowDown":
                this.step();
                break;
            case "ArrowUp":
                var previousRotationState = this.currentTetrimino.rotationState;
                this.currentTetrimino.rotationState = (previousRotationState + 1) % tetrimini[this.currentTetrimino.type].length;
                if (this.collisionExists()) {
                    this.currentTetrimino.rotationState = previousRotationState;
                } else {
                    this.render();
                }
                break;
            case "ArrowLeft":
                this.currentTetrimino.position[1]--;
                if (this.collisionExists()) {
                    this.currentTetrimino.position[1]++;
                } else {
                    this.render();
                }
                break;
            case "ArrowRight":
                this.currentTetrimino.position[1]++;
                if (this.collisionExists()) {
                    this.currentTetrimino.position[1]--;
                } else {
                    this.render();
                }
                break;
            case "Enter":
                this.start(1);
                break;
            case " ":
                this.skip = true;
                while (this.skip) {
                    this.step(true);
                }
                this.step();
                break;
            case "p":
                this.paused = !this.paused;
                if (!this.paused) this.timeout = setTimeout(function() {
                    that.step();
                }, 500);
                break;
        }
    },
    start: function(speed) {
        this.speed = speed || 1;
        this.active = true;
        this.newTetrimino();
        this.step();
    },
    newTetrimino: function() {
        this.skip = false;
        this.currentTetrimino.type = Math.floor(Math.random() * 7);
        this.currentTetrimino.position[1] = 4;
        this.currentTetrimino.position[0] = 0;
        this.currentTetrimino.rotationState = 0;
    },
    step: function(notimer) {
        const that = this;

        let action, breakLoop;

        clearTimeout(this.timeout);

        for (var i = 0; i < this.actionsPerStep; i++) {
            action = this.neuralNetwork.getNetworkReaction();
            console.log(action);

            breakLoop = false;

            switch (action) {
                case 1:
                    breakLoop = true;
                    break;
                case 2:
                    var previousRotationState = this.currentTetrimino.rotationState;
                    this.currentTetrimino.rotationState = (previousRotationState + 1) % tetrimini[this.currentTetrimino.type].length;
                    if (this.collisionExists()) {
                        this.currentTetrimino.rotationState = previousRotationState;
                    } else {
                        this.render();
                    }
                    break;
                case 3:
                    this.currentTetrimino.position[1]--;
                    if (this.collisionExists()) {
                        this.currentTetrimino.position[1]++;
                    } else {
                        this.render();
                    }
                    break;
                case 4:
                    this.currentTetrimino.position[1]++;
                    if (this.collisionExists()) {
                        this.currentTetrimino.position[1]--;
                    } else {
                        this.render();
                    }
                    break;
                case 5:
                    breakLoop = true;
                    this.skip = true;
                    while (this.skip) {
                        this.sinkTetrimino();
                    }
                    break;
            }

            if (breakLoop) break;
        }

        this.sinkTetrimino();

        this.render();

        if (!notimer) this.timeout = setTimeout(function() {
            if (that.active && !that.paused) that.step();
        }, 500/this.speed);
    },
    sinkTetrimino: function() {
        this.currentTetrimino.position[0]++;

        if (this.collisionExists()) {
            this.currentTetrimino.position[0]--;

            this.storeTetrimino();

            this.clearLines();

            this.newTetrimino();

            if (this.collisionExists()) {
                this.currentTetrimino.type = null;
                this.gameOver();
            }
        }
    },
    clearLines: function() {
        for (var y = this.size.y - 2; y >= 0; y--) {
            if (this.tiles[y].indexOf(false) < 0) {
                this.score += 100;
                console.log('SCORED', this.score);

                for (var y_ = y - 1; y_ >= 0; y_--) {
                    this.tiles[y_ + 1] = this.tiles[y_];
                }

                y++;
            }
        }
    },
    collisionExists: function() {
        for (var y = 0; y < 4; y++) {
            for (var x = 0; x < 4; x++) {
                if (tetrimini[this.currentTetrimino.type][this.currentTetrimino.rotationState][y][x] && this.tiles[this.currentTetrimino.position[0] + y][this.currentTetrimino.position[1] + x]) {
                    return true;
                }
            }
        }

        return false;
    },
    storeTetrimino: function() {
        for (var y = 0; y < 4; y++) {
            for (var x = 0; x < 4; x++) {
                if (tetrimini[this.currentTetrimino.type][this.currentTetrimino.rotationState][y][x]) {
                    this.tiles[this.currentTetrimino.position[0] + y][this.currentTetrimino.position[1] + x] = true;
                }
            }
        }
    },
    gameOver: function() {
        console.error('LOST');
        this.active = false;
    },
    render: function() {
        let x, y;
        this.ctx.clearRect(0, 0, this.size.x * 10, this.size.y * 10);

        this.ctx.fillStyle = '#555555';

        for (y = 0; y < this.size.y; y++) {
            for (x = 0; x < this.size.x; x++) {
                if (this.tiles[y][x]) this.ctx.fillRect(x * 10, y * 10, 10, 10);
            }
        }

        if (this.currentTetrimino.type !== null) {
            for (y = 0; y < 4; y++) {
                for (x = 0; x < 4; x++) {
                    if (tetrimini[this.currentTetrimino.type][this.currentTetrimino.rotationState][y][x]) this.ctx.fillRect((this.currentTetrimino.position[1] + x) * 10, (this.currentTetrimino.position[0] + y) * 10, 10, 10);
                }
            }
        }
    }
};



window.addEventListener('load', function() {
    Game.init();
});
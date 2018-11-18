function Game() {
    this.props = {
        canvas: null,
        ctx: null,
        tiles: [],
        size: {
            x: 12,
            y: 21
        },
        active: true,
        currentTetrimino: {
            type: null,
            position: [null, null],
            rotationState: null
        },
        skip: false,
        score: 0,
        actionsPerStep: 20,
        actionCounter: 0,
        network: null
    };

    this.props.canvas = document.createElement('canvas');
    this.props.canvas.width = this.props.size.x * 10;
    this.props.canvas.height = this.props.size.y * 10;
    this.props.ctx = this.props.canvas.getContext('2d');

    for (var y = 0; y < this.props.size.y; y++) {
        this.props.tiles[y] = [];

        for (var x = 0; x < this.props.size.x; x++) {
            this.props.tiles[y][x] = x === 0 || x === 11 || y === 20;
        }
    }

    this.props.network = new NeuralNetwork((this.props.size.x - 2) * (this.props.size.y - 1), 20, 6);


    this.getNetworkReaction = function() {
        let input_vector = [];
        let y;

        for (y = 0; y < this.props.size.y - 1; y++) {
            input_vector = input_vector.concat(this.props.tiles[y].slice(1, this.props.size.x - 1));
        }

        if (this.props.currentTetrimino.type !== null) {
            for (y = 0; y < 4; y++) {
                for (var x = 0; x < 4; x++) {
                    if (tetrimini[this.props.currentTetrimino.type][this.props.currentTetrimino.rotationState][y][x]) {
                        input_vector[(this.props.currentTetrimino.position[0] + y) * (this.props.size.x - 2) + this.props.currentTetrimino.position[1] + x - 1] = true;
                    }
                }
            }
        }

        return this.props.network.calc(input_vector);
    };

    this.newTetrimino = function() {
        this.props.skip = false;
        this.props.currentTetrimino.type = Math.floor(Math.random() * 7);
        this.props.currentTetrimino.position[1] = 4;
        this.props.currentTetrimino.position[0] = 0;
        this.props.currentTetrimino.rotationState = 0;
    };

    this.performAction = function() {
        if (!this.props.active) return;

        const action = this.getNetworkReaction();

        switch (action) {
            case 1:
                this.props.actionCounter = this.props.actionsPerStep;
                break;
            case 2:
                const previousRotationState = this.props.currentTetrimino.rotationState;
                this.props.currentTetrimino.rotationState = (previousRotationState + 1) % tetrimini[this.props.currentTetrimino.type].length;
                if (this.collisionExists()) {
                    this.props.currentTetrimino.rotationState = previousRotationState;
                }
                break;
            case 3:
                this.props.currentTetrimino.position[1]--;
                if (this.collisionExists()) {
                    this.props.currentTetrimino.position[1]++;
                }
                break;
            case 4:
                this.props.currentTetrimino.position[1]++;
                if (this.collisionExists()) {
                    this.props.currentTetrimino.position[1]--;
                }
                break;
            case 5:
                this.props.skip = true;
                while (this.props.skip) {
                    this.sinkTetrimino();
                }
                break;
        }

        if (this.props.actionCounter >= this.props.actionCounter) {
            this.props.actionCounter = 0;
            this.sinkTetrimino();
        }

        this.props.actionCounter++;

        this.render();
    };

    this.sinkTetrimino = function() {
        this.props.currentTetrimino.position[0]++;

        if (this.collisionExists()) {
            this.props.currentTetrimino.position[0]--;

            this.storeTetrimino();

            this.props.score += 5;
            this.clearLines();

            this.newTetrimino();

            if (this.collisionExists()) {
                this.props.currentTetrimino.type = null;
                this.gameOver();
            }
        }
    };

    this.clearLines = function() {
        for (var y = this.props.size.y - 2; y >= 0; y--) {
            if (this.props.tiles[y].indexOf(false) < 0) {
                this.props.score += 100;
                console.log('SCORED', this.props.score);

                for (var y_ = y - 1; y_ >= 0; y_--) {
                    this.props.tiles[y_ + 1] = this.props.tiles[y_];
                }

                y++;
            }
        }
    };

    this.collisionExists = function() {
        if (this.props.currentTetrimino.type === null) return false;

        for (var y = 0; y < 4; y++) {
            for (var x = 0; x < 4; x++) {
                if (tetrimini[this.props.currentTetrimino.type][this.props.currentTetrimino.rotationState][y][x] && this.props.tiles[this.props.currentTetrimino.position[0] + y][this.props.currentTetrimino.position[1] + x]) {
                    return true;
                }
            }
        }

        return false;
    };

    this.storeTetrimino = function() {
        for (var y = 0; y < 4; y++) {
            for (var x = 0; x < 4; x++) {
                if (tetrimini[this.props.currentTetrimino.type][this.props.currentTetrimino.rotationState][y][x]) {
                    this.props.tiles[this.props.currentTetrimino.position[0] + y][this.props.currentTetrimino.position[1] + x] = true;
                }
            }
        }
    };

    this.gameOver = function() {
        console.log('LOST', this.props.score);
        this.props.active = false;
        Site.end(this);
    };

    this.render = function() {
        let x, y;
        this.props.ctx.clearRect(0, 0, this.props.size.x * 10, this.props.size.y * 10);

        this.props.ctx.fillStyle = '#555555';

        for (y = 0; y < this.props.size.y; y++) {
            for (x = 0; x < this.props.size.x; x++) {
                if (this.props.tiles[y][x]) this.props.ctx.fillRect(x * 10, y * 10, 10, 10);
            }
        }

        if (this.props.currentTetrimino.type !== null) {
            for (y = 0; y < 4; y++) {
                for (x = 0; x < 4; x++) {
                    if (tetrimini[this.props.currentTetrimino.type][this.props.currentTetrimino.rotationState][y][x]) this.props.ctx.fillRect((this.props.currentTetrimino.position[1] + x) * 10, (this.props.currentTetrimino.position[0] + y) * 10, 10, 10);
                }
            }
        }
    };



    this.newTetrimino();
}
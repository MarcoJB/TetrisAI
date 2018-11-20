function NeuralNetwork(input_neurons, hidden_neurons, hidden_neurons2, output_neurons, props) {
    var i;

    this.props = props || {
        weights_hidden: [],
        weights_hidden2: [],
        weights_output: [],
        generation: 0,
        mutation: 0,
        id: null
    };

    // increase for bias
    input_neurons++;
    hidden_neurons++;
    hidden_neurons2++;

    for (i = 0; i < hidden_neurons; i++) {
        this.props.weights_hidden[i] = [];

        for (j = 0; j < input_neurons; j++) {
            this.props.weights_hidden[i][j] = Helper.random(-1, 1);
        }
    }

    for (i = 0; i < hidden_neurons2; i++) {
        this.props.weights_hidden2[i] = [];

        for (j = 0; j < hidden_neurons; j++) {
            this.props.weights_hidden2[i][j] = Helper.random(-1, 1);
        }
    }

    for (i = 0; i < output_neurons; i++) {
        this.props.weights_output[i] = [];

        for (j = 0; j < hidden_neurons2; j++) {
            this.props.weights_output[i][j] = Helper.random(-1, 1);
        }
    }

    this.calc = function (inputs) {
        // pad for bias
        inputs = [1].concat(inputs);
        let hidden_values = Helper.matMul(this.props.weights_hidden, inputs);
        hidden_values = Helper.activateVector(hidden_values, 'relu');
        let hidden_values2 = Helper.matMul(this.props.weights_hidden2, hidden_values);
        hidden_values2 = Helper.activateVector(hidden_values2, 'relu');
        let output_values = Helper.matMul(this.props.weights_output, hidden_values2);
        output_values = Helper.activateVector(output_values, 'hs');
        return output_values.indexOf(Math.max(...output_values));
    };

    this.clone = function () {
        const c = JSON.parse(JSON.stringify({
            input_neurons,
            hidden_neurons,
            hidden_neurons2,
            output_neurons,
            props: this.props
        }));
        c.props.generation++;
        return new NeuralNetwork(
            // omit bias
            c.input_neurons - 1,
            c.hidden_neurons - 1,
            c.hidden_neurons2 - 1,
            c.output_neurons,
            c.props);
    };

    this.mutate = function (changeSize) {
        const c = this.clone();
        const change = Math.sqrt(changeSize) || 0.1;

        // mutate just some weights
        for (i = Math.random() * changeSize * this.hidden_neurons; i < this.hidden_neurons; i += Math.random() * change * this.hidden_neurons) {
            for (j = Math.random() * changeSize * this.input_neurons; j < this.input_neurons; i += Math.random() * change * this.input_neurons) {
                c.props.weights_hidden[i] = Helper.random(-1, 1);
            }
        }

        for (i = Math.random() * changeSize * this.hidden_neurons2; i < this.hidden_neurons2; i += Math.random() * change * this.hidden_neurons2) {
            for (j = Math.random() * changeSize * this.hidden_neurons; j < this.hidden_neurons; i += Math.random() * change * this.hidden_neurons) {
                c.props.weights_hidden2[i] = Helper.random(-1, 1);
            }
        }

        for (i = Math.random() * changeSize * this.output_neurons; i < this.output_neurons; i += Math.random() * change * this.output_neurons) {
            for (j = Math.random() * changeSize * this.hidden_neurons2; j < this.hidden_neurons2; i += Math.random() * change * this.hidden_neurons2) {
                c.props.weights_output[i] = Helper.random(-1, 1);
            }
        }

        c.props.mutation++;
        return new NeuralNetwork(
            // omit bias
            this.input_neurons - 1,
            this.hidden_neurons - 1,
            this.hidden_neurons2 - 1,
            this.output_neurons, c.props);
    }
}

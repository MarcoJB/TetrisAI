function NeuralNetwork(input_neurons, hidden_neurons, output_neurons, props) {
    var i;

    this.props = props || {
        weights_hidden: [],
        weights_output: [],
        generation: 0,
        mutation: 0,
        id: null
    };

    for (i = 0; i < hidden_neurons; i++) {
        this.props.weights_hidden[i] = [];

        for (j = 0; j < input_neurons; j++) {
            this.props.weights_hidden[i][j] = Helper.random(-1, 1);
        }
    }

    for (i = 0; i < output_neurons; i++) {
        this.props.weights_output[i] = [];

        for (j = 0; j < hidden_neurons; j++) {
            this.props.weights_output[i][j] = Helper.random(-1, 1);
        }
    }

    this.calc = function (inputs) {
        let hidden_values = Helper.matMul(this.props.weights_hidden, inputs);
        hidden_values = Helper.activateVector(hidden_values, 'relu');
        let output_values = Helper.matMul(this.props.weights_output, hidden_values);
        output_values = Helper.activateVector(hidden_values, 'hs');
        return output_values.indexOf(Math.max(...output_values));
    };

    this.clone = function () {
        const c = JSON.parse(JSON.stringify({input_neurons, hidden_neurons, output_neurons, props: this.props}));
        c.props.generation++;
        return new NeuralNetwork(c.input_neurons, c.hidden_neurons, c.output_neurons, c.props);
    };

    this.mutate = function (changeSize) {
        const c = this.clone();
        const change = changeSize || 0.1;
        for (i = 0; i < this.hidden_neurons; i++) {
            for (j = 0; j < this.input_neurons; j++) {
                c.props.weights_hidden[i][j] += Helper.random(-change, change);
            }
        }
        c.props.mutation++;
        return new NeuralNetwork(this.input_neurons, this.hidden_neurons, this.output_neurons, c.props);
    }
}

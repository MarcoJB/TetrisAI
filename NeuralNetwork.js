function NeuralNetwork(input_neurons, hidden_neurons, output_neurons) {
    var i;

    this.props = {
        weights_hidden: [],
        weights_output: []
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

    this.calc = function(inputs) {
        let hidden_values = Helper.matMul(this.props.weights_hidden, inputs);
        hidden_values = Helper.activateVector(hidden_values, 'relu');
        let output_values = Helper.matMul(this.props.weights_output, hidden_values);
        output_values = Helper.activateVector(hidden_values, 'hs');
        return output_values.indexOf(Math.max(...output_values));
    }
}
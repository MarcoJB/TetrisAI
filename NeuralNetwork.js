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

    for (i = 0; i < hidden_neurons; i++) {
        this.props.weights_hidden[i] = [];

        for (j = 0; j < input_neurons; j++) {
            this.props.weights_hidden[i][j] = Helper.random(-1, 1);
        }
    }

    if (hidden_neurons2 > 0) {
        hidden_neurons2++;

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
    } else {
        // if no second hidden layer should be added
        for (i = 0; i < output_neurons; i++) {
            this.props.weights_output[i] = [];

            for (j = 0; j < hidden_neurons; j++) {
                this.props.weights_output[i][j] = Helper.random(-1, 1);
            }
        }
    }

    this.calc = function (inputs, correctionVector) {
        // pad for bias
        inputs = [1].concat(inputs);

        let hidden_values = Helper.matMul(this.props.weights_hidden, inputs);
        hidden_values = Helper.activateVector(hidden_values, 'relu');
        let output_values;
        if (hidden_neurons2 > 0) {
            let hidden_values2 = Helper.matMul(this.props.weights_hidden2, hidden_values);
            hidden_values2 = Helper.activateVector(hidden_values2, 'relu');
            output_values = Helper.matMul(this.props.weights_output, hidden_values2);
            output_values = Helper.activateVector(output_values, 'sigm');
        } else {
            // if no second hidden layer should be added

            output_values = Helper.matMul(this.props.weights_output, hidden_values);
            output_values = Helper.activateVector(output_values, 'sigm');
        }

        // add predefined correction values
        if (correctionVector) {
            output_values = Helper.vectMul(output_values, correctionVector);
        }
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
            c.hidden_neurons2 > 0 ? c.hidden_neurons2 - 1 : 0,
            c.output_neurons,
            c.props);
    };

    this.mutate = function (changeSize) {
        const c = this.clone();
        const change = Math.sqrt(changeSize) || 0.1;
        // mutate just some weights


        for (let i = Math.random() * change * hidden_neurons; i < hidden_neurons; i += Math.random() * change * hidden_neurons) {
            for (let j = Math.random() * change * input_neurons; j < input_neurons; j += Math.random() * change * input_neurons) {
                c.props.weights_hidden[Math.floor(i)][Math.floor(j)] = Helper.random(-1, 1);
            }
        }

        if (hidden_neurons2 > 0) {
            for (let i = Math.random() * change * hidden_neurons2; i < hidden_neurons2; i += Math.random() * change * hidden_neurons2) {
                for (let j = Math.random() * change * hidden_neurons; j < hidden_neurons; j += Math.random() * change * hidden_neurons) {
                    c.props.weights_hidden2[Math.floor(i)][Math.floor(j)] = Helper.random(-1, 1);
                }
            }

            for (let i = Math.random() * change * output_neurons; i < output_neurons; i += Math.random() * change * output_neurons) {
                for (let j = Math.random() * change * hidden_neurons2; j < hidden_neurons2; j += Math.random() * change * hidden_neurons2) {
                    c.props.weights_output[Math.floor(i)][Math.floor(j)] = Helper.random(-1, 1);
                }
            }
        } else {
            for (let i = Math.random() * change * output_neurons; i < output_neurons; i += Math.random() * change * output_neurons) {
                for (let j = Math.random() * change * hidden_neurons; j < hidden_neurons; j += Math.random() * change * hidden_neurons) {
                    c.props.weights_output[Math.floor(i)][Math.floor(j)] = Helper.random(-1, 1);
                }
            }
        }

        c.props.mutation++;
        return new NeuralNetwork(
            // omit bias
            input_neurons - 1,
            hidden_neurons - 1,
            hidden_neurons2 > 0 ? hidden_neurons2 - 1 : 0,
            output_neurons, c.props);
    }
}

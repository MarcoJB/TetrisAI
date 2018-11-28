function Helper() {
}

Helper.clamp = function (value, min, max) {
    if (value < min) value = min;
    else if (value > max) value = max;
    return value;
};

Helper.random = function (min, max, int) {
    if (typeof int === 'undefined') int = false;

    if (int) {
        return Math.floor(Math.random() * (max + 1 - min)) + min;
    } else {
        return Math.random() * (max - min) + min;
    }
};

Helper.matMul = function (matr, vect) {
    if (matr[0].length !== vect.length) throw(new Error('Vector length and matrix length differ: ' + matr[0].length + ' vs. ' + vect.length));

    var res = [];

    for (var i = 0; i < matr.length; i++) {
        res[i] = Helper.vectMul(matr[i], vect);
    }

    return res;
};

Helper.vectMul = function (vect1, vect2) {
    if (vect1.length !== vect2.length) throw(new Error('Vector lengths differ: ' + vect1.length + ' vs. ' + vect2.length));

    var sum = 0;

    for (var i = 0; i < vect1.length; i++) {
        sum += vect1[i] * vect2[i];
    }

    return sum;
};

Helper.activateVector = function (values, type) {
    var res = [];

    for (var i = 0; i < values.length; i++) {
        res[i] = Helper.activateValue(values[i], type);
    }

    return res;
};

Helper.activateValue = function (value, type) {
    switch (type) {
        case 'lin':
            return value;
        case 'hs':
            return value > 0 ? 1 : 0;
        case 'relu':
            return value > 0 ? value : 0;
        case 'atan':
            return Math.atan(value);
        case 'sigm':
            return 1 / (1 + Math.exp(-value));
    }
};

Helper.displaySign = function (value) {
    if (value > 0) {
        return "+" + value;
    } else {
        return value;
    }
};

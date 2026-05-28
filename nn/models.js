function shapeTo1D(data) {
    let input = [[]];
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            input[0].push(data[j][i] / 255);
        }
    }
    return tf.tensor2d(input);
}

function shapeTo1DTranspose(data) {
    let input = [[]];
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            input[0].push(data[i][j] / 255);
        }
    }
    return tf.tensor2d(input);
}

function shapeTo2D(data) {
    let input = [];
    input[0] = Array.from(Array(28), () => new Array(28));
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            input[0][i][j] = [data[j][i] / 255];
        }
    }
    return tf.tensor4d(input);
}

const models = [
    {
        name: "MNIST DNN",
        path: "./models/MNIST_DNN_tfjs/model.json?v=3",
        inputFunction: shapeTo2D,
        classes: ["0","1","2","3","4","5","6","7","8","9"]
    },
    {
        name: "MNIST CNN",
        path: "./models/MNIST_CNN_tfjs/model.json?v=3",
        inputFunction: shapeTo2D,
        classes: ["0","1","2","3","4","5","6","7","8","9"]
    }
];

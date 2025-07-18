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
        name: "Digits DNN 2025",
        path: "./models/digitsDNN_2025/model.json",
        inputFunction: shapeTo1DTranspose,
        classes: ["0","1","2","3","4","5","6","7","8","9"]
    },
    {
        name: "Digits DNN",
        path: "./models/digitsDNN/model.json",
        inputFunction: shapeTo1DTranspose,
        classes: ["0","1","2","3","4","5","6","7","8","9"]
    },
    {
        name: "Digits CNN",
        path: "./models/digitsCNN/model.json",
        inputFunction: shapeTo2D,
        classes: ["0","1","2","3","4","5","6","7","8","9"]
    },
    {
        name: "Letters DNN",
        path: "./models/lettersDNN/model.json",
        inputFunction: shapeTo1D,
        classes: [
            "A","B","C","D","E","F","G","H","I","J","K","L","M",
            "N","O","P","Q","R","S","T","U","V","W","X","Y","Z"
        ]
    },
    {
        name: "Letters CNN",
        path: "./models/lettersCNN/model.json",
        inputFunction: shapeTo2D,
        classes: [
            "A","B","C","D","E","F","G","H","I","J","K","L","M",
            "N","O","P","Q","R","S","T","U","V","W","X","Y","Z"
        ]
    },
    {
        name: "Digits + Letters DNN",
        path: "./models/digitslettersDNN/model.json",
        inputFunction: shapeTo1D,
        classes: [
            "0","1","2","3","4","5","6","7","8","9",
            "A","B","C","D","E","F","G","H","I","J","K","L","M",
            "N","O","P","Q","R","S","T","U","V","W","X","Y","Z"
        ]
    },
    {
        name: "Digits + Letters CNN",
        path: "./models/digitslettersCNN/model.json",
        inputFunction: shapeTo2D,
        classes: [
            "0","1","2","3","4","5","6","7","8","9",
            "A","B","C","D","E","F","G","H","I","J","K","L","M",
            "N","O","P","Q","R","S","T","U","V","W","X","Y","Z"
        ]
    }
];

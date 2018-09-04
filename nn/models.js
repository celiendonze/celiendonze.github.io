function shapeTo1D(data) {
    let input = [[]];
    for (let i = 0; i < img.length; i++) {
        for (let j = 0; j < img[i].length; j++) {
            input[0].push(img[j][i]/255);
        }
    }
    return tf.tensor2d(input);
}
function shapeTo1DTranspose(data) {
    let input = [[]];
    for (let i = 0; i < img.length; i++) {
        for (let j = 0; j < img[i].length; j++) {
            input[0].push(img[i][j]/255);
        }
    }
    return tf.tensor2d(input);
}
function shapeTo2D(data) {
    let input = [];
    input[0] = Array.from(Array(28), () => new Array(28));
    for (let i = 0; i < img.length; i++) {
        for (let j = 0; j < img[i].length; j++) {
            input[0][i][j] = [img[j][i]/255];
        }
    }
    return tf.tensor4d(input);
}

const models = [
    {
        name: "Digits DNN",
        path: "http://lorkii.esy.es/models/digitsDNN/model.json",
        inputFunction: shapeTo1DTranspose,
        classes: ["0","1","2","3","4","5","6","7","8","9"]
    },
    {
        name: "Digits CNN",
        path: "http://lorkii.esy.es/models/digitsCNN/model.json",
        inputFunction: shapeTo2D,
        classes: ["0","1","2","3","4","5","6","7","8","9"]
    },
    {
        name: "Letters DNN",
        path: "http://lorkii.esy.es/models/lettersDNN/model.json",
        inputFunction: shapeTo1D,
        classes: ["A","B","C","D","E","F","G","H","I","J","K","L","M",
                  "N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]
    },
    {
        name: "Letters CNN",
        path: "http://lorkii.esy.es/models/lettersCNN/model.json",
        inputFunction: shapeTo2D,
        classes: ["A","B","C","D","E","F","G","H","I","J","K","L","M",
                  "N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]
    },
    {
        name: "Digits + Letters DNN",
        path: "http://lorkii.esy.es/models/digitslettersDNN/model.json",
        inputFunction: shapeTo1D,
        classes: ["0","1","2","3","4","5","6","7","8","9",
                  "A","B","C","D","E","F","G","H","I","J","K","L","M",
                  "N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]
    },
    {
        name: "Digits + Letters CNN",
        path: "http://lorkii.esy.es/models/digitslettersCNN/model.json",
        inputFunction: shapeTo2D,
        classes: ["0","1","2","3","4","5","6","7","8","9",
                  "A","B","C","D","E","F","G","H","I","J","K","L","M",
                  "N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]
    }
]

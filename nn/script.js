/**
 * Authors : Biloni Kim, Donzé Célien & Vorpe Fabien
 * Descrption : Main Script application
 *
 * What should it do ?
 * - creating the model and loading it from diffrents file
 * - every time the user draw, it must predict the image
 *      timer event or on_change event
 *      resize the image
 *      prepare the data from the image
 *      use predict
 *      give result to a function -> displayResult()
 */

const imgWidth = 28;
const imgHeight = 28;
const zoom = 10;
var img; // the 2D array that contains the displayed Image
var canvas;
var ctx;
var model = undefined; //activ model
var modelID = 0;
var drawing = false;
var mouseButton = 0;
var chartCtx;

$(document).ready(function() {
    main();
});

/**
 * Resets the displayed Image to black and displays it
 */
function reset() {
  for (let i = 0; i < imgWidth; i++) {
    for (let j = 0; j < imgHeight; j++) {
        img[i][j] = 0;
    }
  }
  drawImage();
  displayResult([]);
  document.getElementById("predictedClass").innerHTML = "";
  document.getElementById("confidence").innerHTML = "";
}

/**
 * Main function, Launched when the page is ready
 */
function main() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    chartCtx = document.getElementById("chart").getContext('2d')
    //creating an empty 28X28 black img
    img = Array.from(Array(imgWidth), () => new Array(imgHeight));
    reset();
    loadModels();
}

/**
 * Creates the Buttons for Loading the models from the "models" List
 * Loads the first model in the List
 */
function loadModels()
{
    let NNButtons = document.getElementById("neuralNetworksButtons");
    for(let i=0;i<models.length;i++) {
        NNButtons.innerHTML += "<button onclick=\"loadModel("+i+")\">" + models[i].name + "</button><br>";
    }
    modelID = 0;
    loadModel(modelID);
}

/**
 * Loads a new Model
 * Change the model and the weight that are used for the prediction
 */
async function loadModel(id) {
    modelID = id;
    document.getElementById("modelName").innerHTML = models[modelID].name;
    document.getElementById('loadingState').style.display = "inline";
    model = await tf.loadModel(models[id].path);
    predict(reset);
    document.getElementById('loadingState').style.display = "none";
}

/**
* Functions used to handle the mouse controls.
*/
function mousePressed(event) {
    drawing = true;
    mouseButton = event.button;
    readDrawing(event);
}
function mouseReleased() {
    drawing = false;
    mouseButton = event.button;
}

/**
 * Read the user's drawing
 * it takes the image form the canevas, transforms it into a matrix, makes it throught the selected NN and display the result
 */
function readDrawing(event) {
    event.preventDefault();
    let e = event || window.event;
    let x = Math.floor(e.offsetX/zoom);
    let y = Math.floor(e.offsetY/zoom);
    if(drawing && x > 0 && y > 0 && x < imgWidth-1 && y < imgHeight-1) {
        if (mouseButton == 0) {
            img[x][y] = 255;
            let grey = 160;
            if(img[x + 1][y] == 0){ img[x + 1][y] = grey; }
            if(img[x - 1][y] == 0){ img[x - 1][y] = grey; }
            if(img[x][y + 1] == 0){ img[x][y + 1] = grey; }
            if(img[x][y - 1] == 0){ img[x][y - 1] = grey; }
        }
        else {
            img[x][y] = 0;
            if(img[x + 1][y] != 0){ img[x + 1][y] = 0; }
            if(img[x - 1][y] != 0){ img[x - 1][y] = 0; }
            if(img[x][y + 1] != 0){ img[x][y + 1] = 0; }
            if(img[x][y - 1] != 0){ img[x][y - 1] = 0; }
        }

        predict();
    }
    drawImage();
}

/**
 * Redraws the Image from the 2D array to the canvas
 */
function drawImage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imgWidth; i++) {
        for (let j = 0; j < imgHeight; j++) {
            ctx.fillStyle = "rgb("+img[i][j]+", "+img[i][j]+", "+img[i][j]+")";
            ctx.fillRect(i*zoom, j*zoom, zoom, zoom);
        }
    }
}

/**
 * Makes a prediction on the displayed image and display a result
 */
async function predict(callback = function(){}){
    const predictedClass = tf.tidy(() => {
        const predictions = model.predict(models[modelID].inputFunction(img));
        return predictions.as1D();
    });

    let predictions = (await predictedClass.data());
    predictedClass.dispose();

    displayResult(predictions);
    callback();
}

/**
 * Display the results from a tensor of probabilities
 */
function displayResult(chartdata) {
    //display the guessed number
    let iMax = argMax(chartdata);
    document.getElementById("predictedClass").innerHTML = models[modelID].classes[iMax];
    document.getElementById("confidence").innerHTML = Math.floor((chartdata[iMax]*100)) + "%";

    //display the probabilities
    var myChart = new Chart(chartCtx, {
        type: 'bar',
        data: {
            labels: models[modelID].classes,
            datasets: [{
                label: 'Probabilities',
                data: chartdata,
                borderWidth: 2
            }]
        },
        options: {
            animation: false,
            events: {

            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });
}

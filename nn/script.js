/**
 * Authors : Biloni Kim, Donzé Célien & Vorpe Fabien
 * Description : Main Script application
 * - Creating the model and loading it from different files
 * - Every time the user draws, it must predict the image
 *      timer event or on_change event
 *      resize the image
 *      prepare the data from the image
 *      use predict
 *      give result to a function -> displayResult()
 */

const imgWidth = 28;
const imgHeight = 28;
const zoom = 10;

let img; // 2D array for the displayed image
let canvas;
let ctx;
let model = undefined; // active model
let modelID = 0;
let drawing = false;
let mouseButton = 0;
let chartCtx;
let myChart = null;

$(document).ready(main);

/**
 * Resets the displayed image to black and displays it
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
 * Main function, launched when the page is ready
 */
function main() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    chartCtx = document.getElementById("chart").getContext('2d');
    img = Array.from(Array(imgWidth), () => new Array(imgHeight));
    reset();
    loadModels();
}

/**
 * Renders the model selection buttons with active status indicators
 */
function updateButtonsUI(isLoading = false) {
    const NNButtons = document.getElementById("neuralNetworksButtons");
    NNButtons.innerHTML = "<p>Models available:</p>";
    for (let i = 0; i < models.length; i++) {
        const isCurrent = (i === modelID);
        let indicator = "";
        if (isCurrent) {
            indicator = isLoading
                ? "<span class='loaded-indicator loading-text'>✓ loading...</span>"
                : "<span class='loaded-indicator'>✓ loaded</span>";
        }
        NNButtons.innerHTML += `
            <div class="model-row">
                <button onclick="loadModel(${i})">${models[i].name}</button>
                <div class="indicator-container">${indicator}</div>
            </div>
        `;
    }
}

/**
 * Creates the buttons for loading the models from the "models" list
 * Loads the first model in the list
 */
function loadModels() {
    modelID = 0;
    updateButtonsUI(true); // Initial load with a "loading..." status
    loadModel(modelID);
}

/**
 * Loads a new model and updates the UI
 */
async function loadModel(id) {
    modelID = id;
    document.getElementById("modelName").innerHTML = models[modelID].name;
    const loadingState = document.getElementById('loadingState');
    loadingState.style.display = "inline";
    loadingState.style.color = "black";
    loadingState.innerHTML = "loading...";

    updateButtonsUI(true); // Display "loading..." indicator beside the selected model button

    try {
        model = await tf.loadLayersModel(models[id].path);
        console.log(`Model ${models[id].name} loaded successfully.`);
        console.log("Model input shape:", model.inputs[0].shape);
        console.log("Model output shape:", model.outputs[0].shape);

        predict(reset);
        loadingState.style.display = "none";
        updateButtonsUI(false); // Update to "loaded" status
    } catch (error) {
        console.error("Failed to load model:", error);
        loadingState.style.color = "red";
        loadingState.innerHTML = "Failed to load model! Ensure you are serving via HTTP (not opening file:// directly) and extensionless weight shards are served correctly.";
        updateButtonsUI(false); // Clear the loading status on failure
    }
}

/**
 * Mouse controls
 */
function mousePressed(event) {
    drawing = true;
    mouseButton = event.button;
    readDrawing(event);
}

function mouseReleased(event) {
    drawing = false;
    mouseButton = event.button;
}

/**
 * Reads the user's drawing and updates the image
 */
function readDrawing(event) {
    event.preventDefault();
    const x = Math.floor(event.offsetX / zoom);
    const y = Math.floor(event.offsetY / zoom);

    if (drawing && x > 0 && y > 0 && x < imgWidth - 1 && y < imgHeight - 1) {
        if (mouseButton === 0) {
            img[x][y] = 255;
            const grey = 160;
            if (img[x + 1][y] === 0) img[x + 1][y] = grey;
            if (img[x - 1][y] === 0) img[x - 1][y] = grey;
            if (img[x][y + 1] === 0) img[x][y + 1] = grey;
            if (img[x][y - 1] === 0) img[x][y - 1] = grey;
        } else {
            img[x][y] = 0;
            if (img[x + 1][y] !== 0) img[x + 1][y] = 0;
            if (img[x - 1][y] !== 0) img[x - 1][y] = 0;
            if (img[x][y + 1] !== 0) img[x][y + 1] = 0;
            if (img[x][y - 1] !== 0) img[x][y - 1] = 0;
        }
        predict();
    }
    drawImage();
}

/**
 * Redraws the image from the 2D array to the canvas
 */
function drawImage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imgWidth; i++) {
        for (let j = 0; j < imgHeight; j++) {
            ctx.fillStyle = `rgb(${img[i][j]},${img[i][j]},${img[i][j]})`;
            ctx.fillRect(i * zoom, j * zoom, zoom, zoom);
        }
    }
}

/**
 * Makes a prediction on the displayed image and displays the result
 */
async function predict(callback = () => {}) {
    let inputTensor = models[modelID].inputFunction(img);

    const predictedClass = tf.tidy(() => {
        const predictions = model.predict(inputTensor);
        return predictions.as1D();
    });

    const predictions = await predictedClass.data();
    predictedClass.dispose();
    console.log("Predictions:", predictions);
    displayResult(predictions);
    callback();
}

/**
 * Displays the results from a tensor of probabilities
 */
function displayResult(chartdata) {
    // Destroy previous Chart instance if it exists to prevent memory leaks and overlapping charts
    if (myChart) {
        myChart.destroy();
        myChart = null;
    }

    // If chartdata is empty, do not try to calculate predictions or render a new chart
    if (!chartdata || chartdata.length === 0) {
        return;
    }

    const iMax = argMax(chartdata);
    document.getElementById("predictedClass").innerHTML = models[modelID].classes[iMax];
    document.getElementById("confidence").innerHTML = Math.floor(chartdata[iMax] * 100) + "%";

    myChart = new Chart(chartCtx, {
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
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: { beginAtZero: true }
                }]
            }
        }
    });
}

# AGENTS.md - MNIST Digit Recognizer (tfjs_mnist)

This directory contains a web application designed for hand-drawn digit recognition using machine learning running entirely client-side.

## Overview
The **Digits Recognizer** is an interactive, browser-based app allowing users to draw a character on a canvas. TensorFlow.js models run in real-time to classify the character as a digit (0-9). Visual feedback is provided using Chart.js to show a real-time probability distribution across all possible classes.

---

## Core Technologies
- **TensorFlow.js (v4.22.0)**: Used for loading pre-trained layers models (`model.json` and weight shards) and running instant client-side predictions.
- **Chart.js (v2.7.2)**: Used to plot class probability bars dynamically.
- **HTML5 Canvas & Vanilla JS**: Powering the drawing interactions and coordinates processing.
- **jQuery (v2.1.1)**: Used for basic document ready initialization.

---

## File Structure & Roles

| File | Role | Status |
| :--- | :--- | :--- |
| [`index.html`](file:///e:/dev/celiendonze.github.io/tfjs_mnist/index.html) | The web interface layout. Integrates libraries and lists interactive zones (canvas, model stats, model selector, probability chart). | **Working** |
| [`style.css`](file:///e:/dev/celiendonze.github.io/tfjs_mnist/style.css) | Custom styling for the layout, margins, buttons, and visual sections. | **Working** |
| [`script.js`](file:///e:/dev/celiendonze.github.io/tfjs_mnist/script.js) | Core orchestration script: listens to drawing events, reshapes image matrices, manages model inference, and renders the probability charts. | **Working** *(with robust error-handling)* |
| [`models.js`](file:///e:/dev/celiendonze.github.io/tfjs_mnist/models.js) | Houses the list of the 2 available neural network models and defines tensor preprocessing functions: `shapeTo1D`, `shapeTo1DTranspose`, and `shapeTo2D`. | **Working** |
| [`utils.js`](file:///e:/dev/celiendonze.github.io/tfjs_mnist/utils.js) | General helper routines (e.g. `argMax`). | **Working** |
| [`ModelButton.js`](file:///e:/dev/celiendonze.github.io/tfjs_mnist/ModelButton.js) | Drafted ES6 class representing an experimental button-handling model interface. | **Unused / Incomplete** |
| `models/` | Holds JSON definitions and `.bin` weight files for both active models. | **Working** |

---

## Active Models

The application dynamically loads and switches between 2 retrained models in the `models/` directory:

1. **MNIST DNN** (`MNIST_DNN_tfjs`):
   - **Type**: Deep Neural Network.
   - **Topology**: InputLayer (28x28x1) -> Flatten -> Dense (512, Relu) -> Dropout -> Dense (512, Relu) -> Dropout -> Dense (256, Relu) -> Dropout -> Dense (10, Softmax).
   - **Input Preprocessing**: Reshapes the drawing canvas matrix to a 4D tensor `[1, 28, 28, 1]` via `shapeTo2D`.
   - **Weights Binary-Safety**: Uses `.bin` extension weights (`group1-shard1of1.bin`), preventing CRLF line ending corruption on Windows (exactly **0 NaN weights**).

2. **MNIST CNN** (`MNIST_CNN_tfjs`):
   - **Type**: Convolutional Neural Network.
   - **Topology**: InputLayer (28x28x1) -> Conv2D (32, 3x3, Relu) -> MaxPooling2D (2x2) -> Dropout -> Conv2D (64, 3x3, Relu) -> MaxPooling2D (2x2) -> Dropout -> Flatten -> Dense (128, Relu) -> Dropout -> Dense (10, Softmax).
   - **Input Preprocessing**: Reshapes the drawing canvas matrix to a 4D tensor `[1, 28, 28, 1]` via `shapeTo2D`.
   - **Weights Binary-Safety**: Uses `.bin` extension weights (`group1-shard1of1.bin`), preventing CRLF line ending corruption on Windows (exactly **0 NaN weights**).

---

## What is Working

1. **Interactive Canvas**:
   - Users can draw with left-click and erase with right-click.
   - Drawing applies a 3x3 brush-like grey antialiasing effect around the main cursor coordinate.
   - The **Reset** button successfully clears the canvas array, prediction values, and the chart.
2. **Asynchronous Model Loading**:
   - Available models are loaded dynamically into buttons on load.
   - Clicking a model button asynchronously fetches the respective model layers from the `models/` directory, updates the UI loaded state, and performs a warm-up run.
   - **New**: Added interactive text status indicators beside each model selector button. It displays `✓ loading...` in italic grey during async model streams, and `✓ loaded` in dark green beside the currently active model.
3. **Tensor Pre-processing**:
   - The drawing is captured on a 280x280px canvas (divided into a `28x28` internal matrix).
   - `models.js` shapes inputs properly via `shapeTo2D` into the required `[1, 28, 28, 1]` 4D shape expected by both models.
4. **Real-time Inference**:
   - Predictions are instantaneous and execute inside `tf.tidy()` to prevent GPU web memory leaks.
5. **Interactive Probabilities Chart (Memory Leak Fixed & Robust)**:
   - Dynamic bar chart using Chart.js that updates in real-time.
   - **Resolved**: Tracked using a global `myChart` instance, which is cleanly destroyed (`myChart.destroy()`) before creating a new one to prevent memory leaks and warning floods.
   - **Resolved**: Added robust validation for empty array parameters (`displayResult([])`) during resets, avoiding `NaN%` UI rendering glitches or Chart.js empty-data crashes.

---

## What is NOT Working / Limitations & Bugs

1. **`ModelButton.js` is Unused**:
   - There is a `ModelButton.js` script in the folder, but it is not imported in `index.html` and its functionality is handled differently by `script.js`.
2. **No Touch Screen Support**:
   - Interaction is bound strictly to `onmousedown`, `onmouseup`, and `onmousemove`. There are no touch event bindings (`touchstart`, `touchmove`, `touchend`), meaning users cannot draw or interact with the app on mobile or tablet touch screens.
3. **Enabled in Root Index**:
    - The entry link to this subfolder (`tfjs_mnist/`) is now enabled in the main `index.html` at the repository's root.

---

## Model Loading Troubleshooting

If the models are not loading and the UI is either stuck or displaying a red error message, this is typically caused by one of the following environment issues:

### 1. Direct File Protocol (`file://`) Block (Most Common)
- **Problem**: Opening `index.html` directly by double-clicking it sets the browser to the `file:///` protocol. Modern browser security policies (Same-Origin Policy / CORS) block `fetch()` requests on local files. Since TensorFlow.js (`tf.loadLayersModel()`) uses standard browser fetch APIs to stream `model.json` and its weight shards, this action is blocked, causing model load failures.
- **Solution**: Always serve the project through an HTTP server (e.g. running `python -m http.server 8000` in the repository root or using VS Code's Live Server) and access it via `http://localhost:8000/tfjs_mnist/`.

### 2. Keras 3 Compatibility (Resolved!)
- **Problem**: Both models were exported using **Keras 3.14.1**, which serializes variable types into complex `DTypePolicy` objects, nested weight initializer classes, and `batch_shape` instead of Keras 2 style formats.
- **Solution**: We successfully resolved this! We recursively cleaned the Keras 3 `DTypePolicy` objects as well as complex Keras 3 initializer objects in the `model.json` of both models, simplifying them to standard, fully compatible Keras 2 string and dictionary configurations. We also mapped `batch_shape` to `batch_input_shape` inside the `InputLayer` config of both models.
- Both models are now **100% compatible, healthy (0 NaNs), and active**!

### 3. Robust Code Solution Implemented
- **What We Did**: We updated `loadModel()` in [`script.js`](file:///e:/dev/celiendonze.github.io/tfjs_mnist/script.js) with a robust `try-catch` wrapper. Instead of silently failing and hanging the UI on `loading...`, the application now intercepts load failures, outputs the error to the browser developer console, and notifies the user directly on screen in red text.

---

## Setup & Local Preview
To run this project locally, run a simple HTTP server in the repository's root folder:
```bash
python -m http.server 8000
```
Then navigate your browser to:
```
http://localhost:8000/tfjs_mnist/
```

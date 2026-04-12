# AGENTS.md

## Overview
Static GitHub Pages site hosting multiple independent web projects. No build process, testing framework, or CI/CD.

## Projects
| Directory | Description |
|-----------|-------------|
| `snake/` | Snake game (PHP backend for highscores) |
| `de/` | Dice matching puzzle game (jQuery) |
| `water_ripples/` | Canvas ripple effect simulation |
| `algonum/` | Phi approximation demo |
| `rain/` | Rain simulation with Plotly analytics |
| `JST_/` | Linux terminal emulation |
| `fourmi/` | Langton's Ant cellular automaton |
| `nn/` | MNIST digit recognition (TensorFlow.js) |
| `webgl/` | WebGL experiments (heart, sun, labo1, labo2) |
| `coralie/` | Simple image toggle (gift box) |

## Development
- Open `index.html` in a browser to preview any project
- No build, test, or lint commands - pure static HTML/CSS/JS
- For local serving: any static file server works (e.g., `python -m http.server`)

## Notes
- Subdirectories may have their own `AGENTS.md` with project-specific details
- `nn/` uses TensorFlow.js models loaded from `models/` directory
- `water_ripples/.htaccess` enables CORS for local development
- `nn/` entry is commented out in root `index.html` (currently disabled)

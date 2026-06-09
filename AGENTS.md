# AGENTS.md

Static GitHub Pages site hosting multiple independent web projects. No build, test, lint, or CI/CD — all projects are pure static HTML/CSS/JS.

Preview any project by opening `index.html` in a browser. For local serving: `python -m http.server`.

## Projects
| Directory | Description |
|-----------|-------------|
| `snake/` | Snake game (PHP backend for highscores) |
| `de/` | Dice matching puzzle (jQuery) |
| `water_ripples/` | Canvas ripple simulation |
| `algonum/` | Phi approximation demo |
| `rain/` | Rain simulation (Plotly analytics) |
| `JST_/` | Linux terminal emulation |
| `fourmi/` | Langton's Ant cellular automaton |
| `tfjs_mnist/` | MNIST digit recognition (TensorFlow.js) |
| `webgl/` | WebGL experiments (heart, labo1, labo2 with sun shader) |
| `coralie/` | Image toggle (gift box) |
| `llm_token_pricing/` | LLM self-hosted hardware token pricing TCO calculator |
| `karaoke_queue/` | Karaoke queue app — handled by a separate repo |

## Notable details
- `rain/`, `de/`, `coralie/` have their own `AGENTS.md` with project-specific info
- `tfjs_mnist/` loads TensorFlow.js models from `models/`
- `water_ripples/.htaccess` enables CORS for local dev
- `snake/` has a PHP backend (`snake.php` + `scores.xml`) for highscores

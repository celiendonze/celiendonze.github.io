# AGENTS.md for Rain Simulation

Static HTML/CSS/JS rain simulation game. No build process - serves files directly.

## Entry points

- `index.html` - main webpage, loads `script.js` and `style.css`
- `script.js` - core game logic, Canvas animation
- `style.css` - styling with CSS variables for dark gradient theme

## Running and testing

- Open `index.html` in a web browser - no server or build needed
- Game runs via `requestAnimationFrame` in `script.js:246`

## Key implementation details

- Canvas hardcoded to 1000x500 (`script.js:1-2`, `index.html:25`)
- Plotly analytics via CDN (`index.html:9`)
- Rain simulation uses collision detection: `script.js:92-120`
- Actor is a simple rectangle (50x100) that moves across the canvas
- Each raindrop has random speed between 4-9 (`script.js:22`)

## Dependencies

- Plotly 2.18.2 via CDN - requires internet for analytics graph
- No other external libraries
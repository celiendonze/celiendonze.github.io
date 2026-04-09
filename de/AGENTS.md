# AGENTS.md

## Tech Stack & Architecture
- **Core**: Vanilla JavaScript, jQuery (loaded from Google CDN).
- **Assets**: 
    - Images: `img/d_[1-6].png` for dice faces.
    - Audio: `sound/` contains `coin_1.wav` through `coin_6.wav`, `dice.wav`, and `win.wav`.
- **Structure**: Single-page web game using absolute positioning for a grid of `<div>` elements.

## Key Development Info
- **Grid Logic**: The grid is `10x7` (`GRID_WIDTH` x `GRID_HEIGHT`).
- **Game Loop**: 
    - `newGame()` initializes the state.
    - `play(x, y)` handles swapping adjacent dice.
    - `testGrid()` checks for 3-in-a-row (horizontal/vertical) and triggers `takeOff()`.
    - `takeOff()` moves dice from the grid to the "win hand" and updates scores.
- **Frontend Assets**: All dice positions are dynamically generated as `div`s in `de.js` inside `#de_area`.

## Verifying Changes
- **Visual/Functional**: Since there are no automated tests, verification must be manual by opening `index.html` in a browser.
- **Dependencies**: Ensure `de.css`, `de.js`, `img/`, and `sound/` are present relative to `index.html`.
- **External Dependencies**: `https://ajax.googleapis.com/ajax/libs/jquery/1.12.2/jquery.min.js` must be accessible.

## Important Constraints
- **No Build Step**: The project is static HTML/JS.
- **CSS Positioning**: The game relies heavily on `absolute` positioning and `background-image` properties. Avoid breaking the coordinate system in `de.js` or `de.css`.

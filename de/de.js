// Constants
const GRID_WIDTH = 10;
const GRID_HEIGHT = 7;
const CELL_SIZE = 80;

// Audio
const audioCoin = [
	new Audio('sound/coin_1.wav'),
	new Audio('sound/coin_2.wav'),
	new Audio('sound/coin_3.wav'),
	new Audio('sound/coin_4.wav'),
	new Audio('sound/coin_5.wav'),
	new Audio('sound/coin_6.wav')
];
const audioDice = new Audio('sound/dice.wav');
const audioWin = new Audio('sound/win.wav');

// Robust Audio Utility
function playSFX(audio, volume = 0.35) {
	if (!audio) return;
	try {
		// Clone node to allow rapid overlapping plays of the same sound effect
		const clone = audio.cloneNode();
		clone.volume = volume;
		const playPromise = clone.play();
		if (playPromise !== undefined) {
			playPromise.catch(error => {
				// Catch browser autoplay permission delays silently
				console.log("Audio playback delayed or blocked by browser policies:", error);
			});
		}
	} catch (e) {
		// Fallback to resetting current time if cloning fails
		audio.currentTime = 0;
		audio.play().catch(err => console.log("Audio play error fallback:", err));
	}
}

// Game State
let position1 = { x: 0, y: 0, set: false };
let position2 = { x: 0, y: 0, set: false };
let game = { score: 0, scoreFinal: 0, movesLeft: 60 };
let goal = {
	brelan: [false, false, false, false, false, false],
	doublePaire: false, dp1: 0, dp2: 0,
	full: false, full2: 0, full3: 0,
	carre: false, carrenum: 0,
	yahtzee: false, yahtzeenum: 0
};
let win = { x: 0, y: 0 };
let winHand = Array(GRID_HEIGHT).fill(0);

// Local Highscores Helpers
function getHighscores() {
	try {
		const scores = localStorage.getItem("de_highscores");
		return scores ? JSON.parse(scores) : [];
	} catch (e) {
		return [];
	}
}

function saveLocalHighscore(pseudo, score) {
	const scores = getHighscores();
	scores.push({ pseudo: pseudo, score: score, date: new Date().toLocaleDateString() });
	// Sort descending
	scores.sort((a, b) => b.score - a.score);
	// Keep top 5 only
	scores.splice(5);
	try {
		localStorage.setItem("de_highscores", JSON.stringify(scores));
	} catch (e) {
		console.error("Failed to save highscore to localStorage", e);
	}
}

function post_highscore() {
	let pseudo = $("#de_pseudo").val();
	if (!pseudo || pseudo.trim() === "") {
		pseudo = "Anonymous";
		$("#de_pseudo").val(pseudo);
	}
	if (game.scoreFinal !== 0) {
		saveLocalHighscore(pseudo, game.scoreFinal);
	}
	$("#form_highscore").hide();
	$("#ty_partage").show();
}

function showHighscoresMenu() {
	const scores = getHighscores();
	let html = `<h3>TOP 5 SCORES:</h3>`;
	if (scores.length === 0) {
		html += `<p>Aucun score enregistré pour le moment.</p>`;
	} else {
		html += `<table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.9em; text-align: left;">
					<thead>
						<tr style="border-bottom: 2px solid white;">
							<th style="padding: 5px;">Pos</th>
							<th style="padding: 5px;">Pseudo</th>
							<th style="padding: 5px; text-align: right;">Score</th>
							<th style="padding: 5px; text-align: right;">Date</th>
						</tr>
					</thead>
					<tbody>`;
		scores.forEach((s, idx) => {
			html += `<tr style="border-bottom: 1px solid #444;">
						<td style="padding: 5px;">${idx + 1}</td>
						<td style="padding: 5px; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${s.pseudo}</td>
						<td style="padding: 5px; text-align: right; font-weight: bold; color: #1b85b8;">${s.score}</td>
						<td style="padding: 5px; text-align: right; font-size: 0.85em; color: #aaa;">${s.date}</td>
					</tr>`;
		});
		html += `</tbody></table>`;
	}
	html += `<button onclick="showRulesMenu();" style="margin: 20px auto 0 auto; display: block; padding: 10px; font-size: 18px; border-radius: 5px; background: #1b85b8; color: white; border: none; cursor: pointer; width: 120px;">Retour</button>`;
	$("#info").html(html);
}

function showRulesMenu() {
	$("#info").html(
		`<h3>INFO:</h3>
		<p>
			Choisissez un dé et permutez-le avec un dé voisin pour qu'un de ces deux dés touche un dé de valeur
			identique et forme une combinaison de trois dés ou plus de la même valeur. La valeur du dé est
			ensuite ajoutée à
			votre main.
		</p>
		<p>
			Le but du jeu est d'obtenir toutes les suites possibles (à droite -->).
		</p>`
	);
}

// Grid Creation
function createGrid() {
	for (let x = 0; x < GRID_WIDTH; x++) {
		for (let y = 0; y < GRID_HEIGHT; y++) {
			deRandom(x, y);
		}
	}
}

// Randomize dice image
function deRandom(x, y) {
	const rand = Math.floor(Math.random() * 6) + 1;
	$(`#${x}_${y}`).css("background-image", `url(img/d_${rand}.png)`);
}

// Initialize Game
function initGame() {
	winHand.fill(0);
	goal = {
		brelan: [false, false, false, false, false, false],
		doublePaire: false, dp1: 0, dp2: 0,
		full: false, full2: 0, full3: 0,
		carre: false, carrenum: 0,
		yahtzee: false, yahtzeenum: 0
	};
	game.score = 0;
	game.movesLeft = 60;
	$("#score").text(game.score);
	$("#movesLeft").text(game.movesLeft);
	setWinHand();
	setGoals();
}

// Update win hand UI
function setWinHand() {
	winHand.forEach((num, i) => {
		$(`#win${i}`).css("backgroundImage", `url(img/d_${num}.png)`);
	});
}

// Update goals UI
function setGoals() {
	goal.brelan.forEach((brelan, i) => {
		const brelanEl = $(`#brelan${i + 1}`);
		brelanEl.toggleClass("goal_done", brelan);
		brelanEl.find("div").css("opacity", brelan ? "1" : "0.4");
	});
	
	const dpEl = $("#doublePaire");
	dpEl.toggleClass("goal_done", goal.doublePaire);
	dpEl.find("div").css("opacity", goal.doublePaire ? "1" : "0.5");
	$(".dp1").css("backgroundImage", `url(img/d_${goal.dp1 || 0}.png)`);
	$(".dp2").css("backgroundImage", `url(img/d_${goal.dp2 || "0b"}.png)`);
	
	const fullEl = $("#full");
	fullEl.toggleClass("goal_done", goal.full);
	fullEl.find("div").css("opacity", goal.full ? "1" : "0.5");
	$(".full2").css("backgroundImage", `url(img/d_${goal.full2 || 0}.png)`);
	$(".full3").css("backgroundImage", `url(img/d_${goal.full3 || "0b"}.png)`);
	
	const carreEl = $("#carre");
	carreEl.toggleClass("goal_done", goal.carre);
	carreEl.find("div").css("opacity", goal.carre ? "1" : "0.5");
	$("#carre div").css("backgroundImage", `url(img/d_${goal.carrenum || 0}.png)`);
	
	const yEl = $("#yahtzee");
	yEl.toggleClass("goal_done", goal.yahtzee);
	yEl.find("div").css("opacity", goal.yahtzee ? "1" : "0.5");
	$("#yahtzee div").css("backgroundImage", `url(img/d_${goal.yahtzeenum || 0}.png)`);
	
	$("#score").text(game.score);
	if (testWin()) {
		playSFX(audioWin, 0.15);
		setTimeout(gameOver, 1000);
	}
}

// Check if all goals are reached
function testWin() {
	return goal.brelan.every(Boolean) &&
		goal.doublePaire && goal.full &&
		goal.carre && goal.yahtzee;
}

// Game Over
function gameOver() {
	const scoreinter = game.movesLeft * 500;
	game.scoreFinal = scoreinter + game.score;
	$("#info").html(
		`<h3>PARTIE TERMINÉE</h3>
		 <p>score: ${game.score}</p>
		 <p>+</p>
		 <p>coups restants: ${game.movesLeft} x 500 = ${scoreinter}</p>
		 <p style="font-size: 1.3em; font-weight: bold; border-top: 1px dashed white; padding-top: 5px;">Score final: ${game.scoreFinal}</p>`
	);
	$("#menu").show();
	$("#form_highscore").show();
	$("#ty_partage").hide();
}

// New Game
function newGame() {
	// Call initGame to prepare board generation state
	initGame();
	createGrid();
	
	// testGrid matches any natural combos generated on startup and refills the board.
	testGrid(true);
	
	// Call initGame a second time to wipe score & win hand to 0 so the player starts clean
	// with a fresh, match-free starting board.
	initGame();
	
	showRulesMenu();
	$("#de_pseudo").val("");
	$("#menu, #form_highscore, #ty_partage").hide();
}

// Add dice to win hand
function addWinHand(numDe) {
	for (let i = 0; i < winHand.length; i++) {
		if (winHand[winHand.length - 1] !== 0) {
			winHand.shift();
			winHand.push(0);
		}
		if (winHand[i] === 0) {
			winHand[i] = numDe;
			break;
		}
	}
}

// Remove dice from win hand and update score/audio
function takeOffWinHand(de, num) {
	let cmpt = num;
	const randNum = Math.floor(Math.random() * 6);
	for (let i = winHand.length - 1; i >= 0; i--) {
		if (winHand[i] === de && cmpt > 0) {
			cmpt--;
			winHand.splice(i, 1);
			winHand.push(0);
		}
	}
	if (num === 2) game.score += 500;
	if (num === 3) game.score += 1000;
	if (num === 4) game.score += 2000;
	if (num === 5) game.score += 5000;
	playSFX(audioCoin[randNum]);
}

// Animate completed dice flying from top Win Hand to the right Goals panel
function animateWinHandToGoal(indices, targetSelector, deValue) {
	if (!indices || indices.length === 0) return;
	
	const targets = $(targetSelector);
	if (targets.length === 0) return;

	const scale = getGameScale();

	indices.forEach((winIdx, i) => {
		const sourceEl = $(`#win${winIdx}`);
		const targetEl = targets.eq(i);
		if (sourceEl.length === 0 || targetEl.length === 0) return;

		// Get absolute page coordinates
		const startOffset = sourceEl.offset();
		const endOffset = targetEl.offset();

		// Create a floating, duplicate die element
		const flying = $("<div class='flying-die'></div>").css({
			position: "absolute",
			left: startOffset.left,
			top: startOffset.top,
			width: sourceEl.width() * scale,
			height: sourceEl.height() * scale,
			backgroundImage: `url(img/d_${deValue}.png)`,
			backgroundSize: "cover",
			backgroundRepeat: "no-repeat",
			backgroundPosition: "center",
			borderRadius: `${10 * scale}px`,
			border: `${2 * scale}px solid black`,
			boxShadow: `0 ${4 * scale}px ${15 * scale}px rgba(0, 0, 0, 0.6)`,
			zIndex: 1000,
			opacity: 0.95
		}).appendTo("body");

		// 1. Position and scale slide animation
		flying.animate({
			left: endOffset.left,
			top: endOffset.top,
			width: targetEl.width() * scale,
			height: targetEl.height() * scale,
			opacity: 1
		}, {
			duration: 600,
			easing: "swing",
			complete: function () {
				flying.remove();
			}
		});

		// 2. Parallel spin rotation animation!
		$({ deg: 0 }).animate({ deg: 360 }, {
			duration: 600,
			step: function (now) {
				flying.css({
					transform: `rotate(${now}deg)`
				});
			}
		});
	});
}

// Test win hand for goals
function testWinHand() {
	const counts = Array(6).fill(0);
	winHand.forEach(num => { if (num) counts[num - 1]++; });

	// Yahtzee
	if (!goal.yahtzee) {
		counts.forEach((n, i) => {
			if (n >= 5) {
				goal.yahtzee = true;
				goal.yahtzeenum = i + 1;
				// Capture indices before they are cleared from winHand array
				const indices = [];
				winHand.forEach((val, idx) => {
					if (val === i + 1 && indices.length < 5) indices.push(idx);
				});
				animateWinHandToGoal(indices, "#yahtzee div", i + 1);
				takeOffWinHand(i + 1, 5);
			}
		});
	}
	// Carre
	if (!goal.carre) {
		counts.forEach((n, i) => {
			if (n >= 4) {
				goal.carre = true;
				goal.carrenum = i + 1;
				const indices = [];
				winHand.forEach((val, idx) => {
					if (val === i + 1 && indices.length < 4) indices.push(idx);
				});
				animateWinHandToGoal(indices, "#carre div", i + 1);
				takeOffWinHand(i + 1, 4);
			}
		});
	}
	// Full
	if (!goal.full) {
		for (let i = 0; i < 6; i++) {
			if (counts[i] >= 3) {
				goal.full3 = i + 1;
				for (let j = 0; j < 6; j++) {
					if (j !== i && counts[j] >= 2) {
						goal.full = true;
						goal.full2 = j + 1;
						
						// Capture indices for full house components
						const indices3 = [];
						const indices2 = [];
						winHand.forEach((val, idx) => {
							if (val === i + 1 && indices3.length < 3) indices3.push(idx);
							else if (val === j + 1 && indices2.length < 2) indices2.push(idx);
						});
						
						animateWinHandToGoal(indices3, ".full3", i + 1);
						animateWinHandToGoal(indices2, ".full2", j + 1);
						
						takeOffWinHand(i + 1, 3);
						takeOffWinHand(j + 1, 2);
						break;
					}
				}
				if (goal.full) break;
			}
		}
	}
	// Double Paire
	if (!goal.doublePaire) {
		for (let i = 0; i < 6; i++) {
			if (counts[i] >= 2) {
				goal.dp1 = i + 1;
				for (let j = i + 1; j < 6; j++) {
					if (counts[j] >= 2) {
						goal.doublePaire = true;
						goal.dp2 = j + 1;
						
						// Capture indices for double pair components
						const indices1 = [];
						const indices2 = [];
						winHand.forEach((val, idx) => {
							if (val === i + 1 && indices1.length < 2) indices1.push(idx);
							else if (val === j + 1 && indices2.length < 2) indices2.push(idx);
						});
						
						animateWinHandToGoal(indices1, ".dp1", i + 1);
						animateWinHandToGoal(indices2, ".dp2", j + 1);
						
						takeOffWinHand(i + 1, 2);
						takeOffWinHand(j + 1, 2);
						break;
					}
				}
				if (goal.doublePaire) break;
			}
		}
	}
	// Brelan
	counts.forEach((n, i) => {
		if (n >= 3 && !goal.brelan[i]) {
			goal.brelan[i] = true;
			const indices = [];
			winHand.forEach((val, idx) => {
				if (val === i + 1 && indices.length < 3) indices.push(idx);
			});
			animateWinHandToGoal(indices, `#brelan${i + 1} div`, i + 1);
			takeOffWinHand(i + 1, 3);
		}
	});

	setWinHand();
	setGoals();
}

// Check if there is holes in grid
function thereIsHoles() {
	for (let x = 0; x < GRID_WIDTH; x++) {
		for (let y = 0; y < GRID_HEIGHT; y++) {
			if ($(`#${x}_${y}`).css("backgroundImage") === "none") return true;
		}
	}
	return false;
}

// Fill grid holes
function fillGrid(init = false) {
	while (thereIsHoles()) {
		for (let x = 0; x < GRID_WIDTH; x++) {
			for (let y = 0; y < GRID_HEIGHT; y++) {
				if ($(`#${x}_${y}`).css("backgroundImage") === "none") {
					if (y !== 0) {
						const newImg = $(`#${x}_${y - 1}`).css("backgroundImage");
						$(`#${x}_${y}`).css("backgroundImage", newImg);
						$(`#${x}_${y - 1}`).css("backgroundImage", "none");
					} else {
						deRandom(x, y);
					}
				}
			}
		}
		if (init) {
			testGrid(init);
		} else {
			setTimeout(testGrid, 500);
		}
	}
}

// Remove dice from grid and add to win hand
function takeOff(positionX, positionY, number, direction) {
	const imgUrl = $(`#${positionX}_${positionY}`).css("backgroundImage");
	for (let i = 1; i <= 6; i++) {
		if (imgUrl.includes(`d_${i}.png`)) addWinHand(i);
	}
	for (let i = 0; i < number; i++) {
		if (direction === "hor") {
			$(`#${positionX + i}_${positionY}`).css("backgroundImage", "none");
		} else {
			$(`#${positionX}_${positionY + i}`).css("backgroundImage", "none");
		}
	}
}

// Main grid test
function testGrid(init = false) {
	let bool = false;
	
	// Horizontal match detection
	for (let y = 0; y < GRID_HEIGHT; y++) {
		let img = $(`#0_${y}`).css("backgroundImage");
		let num = 1;
		win.x = 0;
		win.y = y;
		
		// Loop up to GRID_WIDTH (inclusive) to process matches at the grid's rightmost edge.
		for (let x = 1; x <= GRID_WIDTH; x++) {
			// Clean boundary checks: do not query jQuery for non-existent DOM element `#10_y`.
			const testimg = (x < GRID_WIDTH) ? $(`#${x}_${y}`).css("backgroundImage") : null;
			
			if (img && testimg && img === testimg) {
				num++;
			} else {
				if (num >= 3) {
					takeOff(win.x, win.y, num, "hor");
					if (!init) playSFX(audioDice);
					bool = true;
				}
				win.x = x;
				num = 1;
			}
			img = testimg;
		}
	}
	
	// Vertical match detection
	for (let x = 0; x < GRID_WIDTH; x++) {
		let img = $(`#${x}_0`).css("backgroundImage");
		let num = 1;
		win.x = x;
		win.y = 0;
		
		// Loop up to GRID_HEIGHT (inclusive) to process matches at the grid's bottommost edge.
		for (let y = 1; y <= GRID_HEIGHT; y++) {
			// Clean boundary checks: do not query jQuery for non-existent DOM element `#x_7`.
			const testimg = (y < GRID_HEIGHT) ? $(`#${x}_${y}`).css("backgroundImage") : null;
			
			if (img && testimg && img === testimg) {
				num++;
			} else {
				if (num >= 3) {
					takeOff(win.x, win.y, num, "ver");
					if (!init) playSFX(audioDice);
					bool = true;
				}
				win.y = y;
				num = 1;
			}
			img = testimg;
		}
	}
	
	if (init) {
		fillGrid(init);
	} else {
		setTimeout(fillGrid, 500);
	}
	setWinHand();
	testWinHand();
	return bool;
}

// Switchable positions
function canBeSwitched(x1, y1, x2, y2) {
	return ((Math.abs(x1 - x2) === 1 && y1 === y2) ||
		(Math.abs(y1 - y2) === 1 && x1 === x2));
}

// Play move
function play(x, y) {
	// Block play if the game is over
	if (game.movesLeft < 1 || testWin()) return;

	if (!position1.set) {
		position1 = { x, y, set: true };
		$(`#${x}_${y}`).addClass("de_clicked");
	} else {
		// If they click the same selected die, deselect it
		if (position1.x === x && position1.y === y) {
			$(`#${position1.x}_${position1.y}`).removeClass("de_clicked");
			position1.set = false;
			return;
		}

		if (canBeSwitched(position1.x, position1.y, x, y)) {
			// Swap targets adjacent: proceed with move
			position2 = { x, y, set: true };

			const p1 = $(`#${position1.x}_${position1.y}`);
			const p2 = $(`#${position2.x}_${position2.y}`);

			const img1 = p1.css("backgroundImage");
			const img2 = p2.css("backgroundImage");

			// Get absolute layout positions
			const left1 = position1.x * CELL_SIZE;
			const top1 = position1.y * CELL_SIZE;
			const left2 = position2.x * CELL_SIZE;
			const top2 = position2.y * CELL_SIZE;

			// Highlight active swap visual layer
			p1.css("z-index", 15);
			p2.css("z-index", 15);

			const prevPos1 = { x: position1.x, y: position1.y };
			const prevPos2 = { x: position2.x, y: position2.y };

			// Deselect elements instantly before sliding
			p1.removeClass("de_clicked");
			p2.removeClass("de_clicked");

			position1.set = position2.set = false;

			// Slide elements to each other's coordinates
			$.when(
				p1.animate({ left: left2, top: top2 }, 250),
				p2.animate({ left: left1, top: top1 }, 250)
			).then(function () {
				// Swap background images in the DOM
				p1.css("backgroundImage", img2);
				p2.css("backgroundImage", img1);

				// Reset original coordinate layout positions
				p1.css({ left: left1, top: top1, "z-index": "" });
				p2.css({ left: left2, top: top2, "z-index": "" });

				if (!testGrid()) {
					// Swap failed: slide back
					p1.css("z-index", 15);
					p2.css("z-index", 15);

					$.when(
						p1.animate({ left: left2, top: top2 }, 200),
						p2.animate({ left: left1, top: top1 }, 200)
					).then(function () {
						p1.css("backgroundImage", img1);
						p2.css("backgroundImage", img2);
						p1.css({ left: left1, top: top1, "z-index": "" });
						p2.css({ left: left2, top: top2, "z-index": "" });
					});
				} else {
					game.movesLeft--;
					$("#movesLeft").text(game.movesLeft);
					if (game.movesLeft < 1) gameOver();
				}
			});
		} else {
			// Smart Selection UX: Clicked non-adjacent die, select it as the new active die!
			$(`#${position1.x}_${position1.y}`).removeClass("de_clicked");
			position1 = { x, y, set: true };
			$(`#${x}_${y}`).addClass("de_clicked");
		}
	}
}

// UI setup
$(function () {
	// Replaced JS coordinate-offset calculation with fully responsive flexbox-based layouts.
	$("#form_highscore, #ty_partage").hide();

	// Create grid elements dynamically
	for (let x = 0; x < GRID_WIDTH; x++) {
		for (let y = 0; y < GRID_HEIGHT; y++) {
			$(document.createElement("div"))
				.css({
					position: "absolute",
					left: x * CELL_SIZE,
					top: y * CELL_SIZE,
					width: `${CELL_SIZE}px`,
					height: `${CELL_SIZE}px`,
					display: "inline-block",
					backgroundImage: "url(img/d_0.png)"
				})
				.attr("id", `${x}_${y}`)
				.attr("onclick", `play(${x},${y});`)
				.appendTo($("#de_area"));
		}
	}

	// Trigger initial responsive layout sizing
	resizeGame();
	$(window).on("resize", resizeGame);
});

// Viewport Scaling Helper Functions
function getGameScale() {
	const layout = document.getElementById("game_layout");
	if (!layout) return 1;
	const transform = window.getComputedStyle(layout).transform;
	if (transform && transform !== 'none') {
		const values = transform.split('(')[1].split(')')[0].split(',');
		return parseFloat(values[0]) || 1;
	}
	return 1;
}

function dismissRotationPrompt() {
	$("body").addClass("bypass-prompt");
	resizeGame();
}

function resizeGame() {
	const scaler = $("#game_scaler");
	const layout = $("#game_layout");
	if (scaler.length === 0 || layout.length === 0) return;

	// Reset styles to calculate natural dimensions
	layout.css({
		"transform": "",
		"transform-origin": "",
		"margin": ""
	});
	scaler.css("height", "");

	const unscaledWidth = layout.outerWidth();
	const unscaledHeight = layout.outerHeight();

	// Calculate target scale to fit viewport beautifully with padding
	const padding = 20;
	const availableWidth = window.innerWidth - padding;
	const availableHeight = window.innerHeight - padding;

	const scaleX = availableWidth / unscaledWidth;
	const scaleY = availableHeight / unscaledHeight;

	// Scale down to fit the smaller dimension, capping max at 1.0 (no upscale)
	let scale = Math.min(scaleX, scaleY);
	if (scale > 1.0) scale = 1.0;
	if (scale < 0.2) scale = 0.2; // Absolute safety floor

	// Apply scale
	layout.css({
		"transform": `scale(${scale})`,
		"transform-origin": "top center",
		"margin": "0 auto"
	});

	// Adjust wrapper height to prevent overflow/scrolling
	scaler.css("height", `${unscaledHeight * scale}px`);
}

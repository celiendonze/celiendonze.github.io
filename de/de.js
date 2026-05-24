// Central Configuration
const GAME_CONFIG = {
	gridWidth: 10,
	gridHeight: 7,
	cellSize: 80,
	initialMoves: 60,
	audioVolume: 0.35,
	paths: {
		diceImage: (num) => `img/d_${num}.png`,
		soundCoin: (num) => `sound/coin_${num}.wav`,
		soundDice: 'sound/dice.wav',
		soundWin: 'sound/win.wav'
	}
};

// Global/Shared Audio Instance Cache
const AudioManager = {
	audioCoins: Array.from({ length: 6 }, (_, i) => new Audio(GAME_CONFIG.paths.soundCoin(i + 1))),
	audioDice: new Audio(GAME_CONFIG.paths.soundDice),
	audioWin: new Audio(GAME_CONFIG.paths.soundWin),

	playSFX(audio, volume = GAME_CONFIG.audioVolume) {
		if (!audio) return;
		try {
			const clone = audio.cloneNode();
			clone.volume = volume;
			const playPromise = clone.play();
			if (playPromise !== undefined) {
				playPromise.catch(error => {
					console.log("Audio playback delayed or blocked by browser policies:", error);
				});
			}
		} catch (e) {
			audio.currentTime = 0;
			audio.play().catch(err => console.log("Audio play error fallback:", err));
		}
	}
};

// Local Highscores Manager
const StorageManager = {
	getHighscores() {
		try {
			const scores = localStorage.getItem("de_highscores");
			return scores ? JSON.parse(scores) : [];
		} catch (e) {
			return [];
		}
	},

	saveLocalHighscore(pseudo, score) {
		const scores = this.getHighscores();
		scores.push({ pseudo: pseudo, score: score, date: new Date().toLocaleDateString() });
		scores.sort((a, b) => b.score - a.score);
		scores.splice(5);
		try {
			localStorage.setItem("de_highscores", JSON.stringify(scores));
		} catch (e) {
			console.error("Failed to save highscore to localStorage", e);
		}
	}
};

// Game State
const gameState = {
	grid: Array.from({ length: GAME_CONFIG.gridWidth }, () => Array(GAME_CONFIG.gridHeight).fill(0)),
	winHand: Array(GAME_CONFIG.gridHeight).fill(0),
	position1: { x: 0, y: 0, set: false },
	position2: { x: 0, y: 0, set: false },
	score: 0,
	scoreFinal: 0,
	movesLeft: GAME_CONFIG.initialMoves,
	goal: {
		brelan: [false, false, false, false, false, false],
		doublePaire: false, dp1: 0, dp2: 0,
		full: false, full2: 0, full3: 0,
		carre: false, carrenum: 0,
		yahtzee: false, yahtzeenum: 0
	}
};

let isAnimating = false; // Lock clicking during animations

// Render functions
function renderGrid() {
	for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
		for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
			const cellVal = gameState.grid[x][y];
			const cellEl = document.getElementById(`${x}_${y}`);
			if (cellEl) {
				if (cellVal === 0) {
					cellEl.style.backgroundImage = "none";
				} else {
					cellEl.style.backgroundImage = `url(${GAME_CONFIG.paths.diceImage(cellVal)})`;
				}
			}
		}
	}
}

function renderWinHand() {
	gameState.winHand.forEach((num, i) => {
		const winEl = document.getElementById(`win${i}`);
		if (winEl) {
			winEl.style.backgroundImage = `url(${GAME_CONFIG.paths.diceImage(num)})`;
		}
	});
}

function renderGoals() {
	const goal = gameState.goal;
	
	// Brelans
	goal.brelan.forEach((brelan, i) => {
		const brelanEl = document.getElementById(`brelan${i + 1}`);
		if (brelanEl) {
			brelanEl.classList.toggle("goal_done", brelan);
			brelanEl.querySelectorAll("div").forEach(div => {
				div.style.opacity = brelan ? "1" : "0.4";
			});
		}
	});

	// Double Paire
	const dpEl = document.getElementById("doublePaire");
	if (dpEl) {
		dpEl.classList.toggle("goal_done", goal.doublePaire);
		dpEl.querySelectorAll("div").forEach(div => {
			div.style.opacity = goal.doublePaire ? "1" : "0.5";
		});
	}
	document.querySelectorAll(".dp1").forEach(el => {
		el.style.backgroundImage = `url(${GAME_CONFIG.paths.diceImage(goal.dp1 || 0)})`;
	});
	document.querySelectorAll(".dp2").forEach(el => {
		el.style.backgroundImage = `url(${GAME_CONFIG.paths.diceImage(goal.dp2 || '0b')})`;
	});

	// Full
	const fullEl = document.getElementById("full");
	if (fullEl) {
		fullEl.classList.toggle("goal_done", goal.full);
		fullEl.querySelectorAll("div").forEach(div => {
			div.style.opacity = goal.full ? "1" : "0.5";
		});
	}
	document.querySelectorAll(".full2").forEach(el => {
		el.style.backgroundImage = `url(${GAME_CONFIG.paths.diceImage(goal.full2 || 0)})`;
	});
	document.querySelectorAll(".full3").forEach(el => {
		el.style.backgroundImage = `url(${GAME_CONFIG.paths.diceImage(goal.full3 || '0b')})`;
	});

	// Carre
	const carreEl = document.getElementById("carre");
	if (carreEl) {
		carreEl.classList.toggle("goal_done", goal.carre);
		carreEl.querySelectorAll("div").forEach(div => {
			div.style.opacity = goal.carre ? "1" : "0.5";
			div.style.backgroundImage = `url(${GAME_CONFIG.paths.diceImage(goal.carrenum || 0)})`;
		});
	}

	// Yahtzee
	const yEl = document.getElementById("yahtzee");
	if (yEl) {
		yEl.classList.toggle("goal_done", goal.yahtzee);
		yEl.querySelectorAll("div").forEach(div => {
			div.style.opacity = goal.yahtzee ? "1" : "0.5";
			div.style.backgroundImage = `url(${GAME_CONFIG.paths.diceImage(goal.yahtzeenum || 0)})`;
		});
	}

	document.getElementById("score").textContent = gameState.score;
	if (testWin()) {
		AudioManager.playSFX(AudioManager.audioWin, 0.15);
		setTimeout(gameOver, 1000);
	}
}

// Game Core Logic
function initGame() {
	gameState.winHand.fill(0);
	gameState.goal = {
		brelan: [false, false, false, false, false, false],
		doublePaire: false, dp1: 0, dp2: 0,
		full: false, full2: 0, full3: 0,
		carre: false, carrenum: 0,
		yahtzee: false, yahtzeenum: 0
	};
	gameState.score = 0;
	gameState.movesLeft = GAME_CONFIG.initialMoves;
	
	document.getElementById("score").textContent = gameState.score;
	document.getElementById("movesLeft").textContent = gameState.movesLeft;
	
	renderWinHand();
	renderGoals();
}

function testWin() {
	return gameState.goal.brelan.every(Boolean) &&
		gameState.goal.doublePaire && gameState.goal.full &&
		gameState.goal.carre && gameState.goal.yahtzee;
}

function gameOver() {
	const scoreinter = gameState.movesLeft * 500;
	gameState.scoreFinal = scoreinter + gameState.score;
	const infoEl = document.getElementById("info");
	if (infoEl) {
		infoEl.innerHTML = `<h3>PARTIE TERMINÉE</h3>
			 <p>score: ${gameState.score}</p>
			 <p>+</p>
			 <p>coups restants: ${gameState.movesLeft} x 500 = ${scoreinter}</p>
			 <p style="font-size: 1.3em; font-weight: bold; border-top: 1px dashed white; padding-top: 5px;">Score final: ${gameState.scoreFinal}</p>`;
	}
	const menuEl = document.getElementById("menu");
	if (menuEl) menuEl.style.display = "flex";
	const formHighscore = document.getElementById("form_highscore");
	if (formHighscore) formHighscore.style.display = "flex";
	const tyPartage = document.getElementById("ty_partage");
	if (tyPartage) tyPartage.style.display = "none";
}

async function newGame() {
	initGame();
	
	// Randomize starting board
	for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
		for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
			gameState.grid[x][y] = Math.floor(Math.random() * 6) + 1;
		}
	}
	renderGrid();

	// Clear startup combos and refill
	await testGrid(true);

	// Wipe scoring & win hand clean for fresh game start
	initGame();

	showRulesMenu();
	const pseudoEl = document.getElementById("de_pseudo");
	if (pseudoEl) pseudoEl.value = "";
	
	const menuEl = document.getElementById("menu");
	if (menuEl) menuEl.style.display = "none";
	const formHighscore = document.getElementById("form_highscore");
	if (formHighscore) formHighscore.style.display = "none";
	const tyPartage = document.getElementById("ty_partage");
	if (tyPartage) tyPartage.style.display = "none";
}

function addWinHand(numDe) {
	for (let i = 0; i < gameState.winHand.length; i++) {
		if (gameState.winHand[gameState.winHand.length - 1] !== 0) {
			gameState.winHand.shift();
			gameState.winHand.push(0);
		}
		if (gameState.winHand[i] === 0) {
			gameState.winHand[i] = numDe;
			break;
		}
	}
}

function takeOffWinHand(de, num, init = false) {
	let cmpt = num;
	const randNum = Math.floor(Math.random() * 6);
	for (let i = gameState.winHand.length - 1; i >= 0; i--) {
		if (gameState.winHand[i] === de && cmpt > 0) {
			cmpt--;
			gameState.winHand.splice(i, 1);
			gameState.winHand.push(0);
		}
	}
	if (num === 2) gameState.score += 500;
	if (num === 3) gameState.score += 1000;
	if (num === 4) gameState.score += 2000;
	if (num === 5) gameState.score += 5000;
	if (!init) AudioManager.playSFX(AudioManager.audioCoins[randNum]);
}

function animateWinHandToGoal(indices, targetSelector, deValue) {
	if (!indices || indices.length === 0) return;

	const targets = document.querySelectorAll(targetSelector);
	if (targets.length === 0) return;

	const scale = getGameScale();

	indices.forEach((winIdx, i) => {
		const sourceEl = document.getElementById(`win${winIdx}`);
		const targetEl = targets[i] || targets[targets.length - 1];
		if (!sourceEl || !targetEl) return;

		const startRect = sourceEl.getBoundingClientRect();
		const endRect = targetEl.getBoundingClientRect();

		const startOffset = {
			left: startRect.left + window.scrollX,
			top: startRect.top + window.scrollY
		};
		const endOffset = {
			left: endRect.left + window.scrollX,
			top: endRect.top + window.scrollY
		};

		const flying = document.createElement("div");
		flying.className = "flying-die";
		
		const sourceWidth = sourceEl.offsetWidth;
		const sourceHeight = sourceEl.offsetHeight;
		const targetWidth = targetEl.offsetWidth;
		const targetHeight = targetEl.offsetHeight;

		Object.assign(flying.style, {
			position: "absolute",
			left: `${startOffset.left}px`,
			top: `${startOffset.top}px`,
			width: `${sourceWidth * scale}px`,
			height: `${sourceHeight * scale}px`,
			backgroundImage: `url(${GAME_CONFIG.paths.diceImage(deValue)})`,
			backgroundSize: "cover",
			backgroundRepeat: "no-repeat",
			backgroundPosition: "center",
			borderRadius: `${10 * scale}px`,
			border: `${2 * scale}px solid black`,
			boxShadow: `0 ${4 * scale}px ${15 * scale}px rgba(0, 0, 0, 0.6)`,
			zIndex: "1000",
			opacity: "0.95"
		});
		
		document.body.appendChild(flying);

		const anim = flying.animate([
			{
				left: `${startOffset.left}px`,
				top: `${startOffset.top}px`,
				width: `${sourceWidth * scale}px`,
				height: `${sourceHeight * scale}px`,
				transform: 'rotate(0deg)',
				opacity: 0.95
			},
			{
				left: `${endOffset.left}px`,
				top: `${endOffset.top}px`,
				width: `${targetWidth * scale}px`,
				height: `${targetHeight * scale}px`,
				transform: 'rotate(360deg)',
				opacity: 1
			}
		], {
			duration: 600,
			easing: 'ease-in-out'
		});

		anim.onfinish = () => {
			flying.remove();
		};
	});
}

function testWinHand(init = false) {
	const counts = Array(6).fill(0);
	gameState.winHand.forEach(num => { if (num) counts[num - 1]++; });

	// Yahtzee
	if (!gameState.goal.yahtzee) {
		counts.forEach((n, i) => {
			if (n >= 5) {
				gameState.goal.yahtzee = true;
				gameState.goal.yahtzeenum = i + 1;
				const indices = [];
				gameState.winHand.forEach((val, idx) => {
					if (val === i + 1 && indices.length < 5) indices.push(idx);
				});
				if (!init) animateWinHandToGoal(indices, "#yahtzee div", i + 1);
				takeOffWinHand(i + 1, 5, init);
			}
		});
	}
	// Carre
	if (!gameState.goal.carre) {
		counts.forEach((n, i) => {
			if (n >= 4) {
				gameState.goal.carre = true;
				gameState.goal.carrenum = i + 1;
				const indices = [];
				gameState.winHand.forEach((val, idx) => {
					if (val === i + 1 && indices.length < 4) indices.push(idx);
				});
				if (!init) animateWinHandToGoal(indices, "#carre div", i + 1);
				takeOffWinHand(i + 1, 4, init);
			}
		});
	}
	// Full
	if (!gameState.goal.full) {
		for (let i = 0; i < 6; i++) {
			if (counts[i] >= 3) {
				gameState.goal.full3 = i + 1;
				for (let j = 0; j < 6; j++) {
					if (j !== i && counts[j] >= 2) {
						gameState.goal.full = true;
						gameState.goal.full2 = j + 1;

						const indices3 = [];
						const indices2 = [];
						gameState.winHand.forEach((val, idx) => {
							if (val === i + 1 && indices3.length < 3) indices3.push(idx);
							else if (val === j + 1 && indices2.length < 2) indices2.push(idx);
						});

						if (!init) {
							animateWinHandToGoal(indices3, ".full3", i + 1);
							animateWinHandToGoal(indices2, ".full2", j + 1);
						}

						takeOffWinHand(i + 1, 3, init);
						takeOffWinHand(j + 1, 2, init);
						break;
					}
				}
				if (gameState.goal.full) break;
			}
		}
	}
	// Double Paire
	if (!gameState.goal.doublePaire) {
		for (let i = 0; i < 6; i++) {
			if (counts[i] >= 2) {
				gameState.goal.dp1 = i + 1;
				for (let j = i + 1; j < 6; j++) {
					if (counts[j] >= 2) {
						gameState.goal.doublePaire = true;
						gameState.goal.dp2 = j + 1;

						const indices1 = [];
						const indices2 = [];
						gameState.winHand.forEach((val, idx) => {
							if (val === i + 1 && indices1.length < 2) indices1.push(idx);
							else if (val === j + 1 && indices2.length < 2) indices2.push(idx);
						});

						if (!init) {
							animateWinHandToGoal(indices1, ".dp1", i + 1);
							animateWinHandToGoal(indices2, ".dp2", j + 1);
						}

						takeOffWinHand(i + 1, 2, init);
						takeOffWinHand(j + 1, 2, init);
						break;
					}
				}
				if (gameState.goal.doublePaire) break;
			}
		}
	}
	// Brelan
	counts.forEach((n, i) => {
		if (n >= 3 && !gameState.goal.brelan[i]) {
			gameState.goal.brelan[i] = true;
			const indices = [];
			gameState.winHand.forEach((val, idx) => {
				if (val === i + 1 && indices.length < 3) indices.push(idx);
			});
			if (!init) animateWinHandToGoal(indices, `#brelan${i + 1} div`, i + 1);
			takeOffWinHand(i + 1, 3, init);
		}
	});

	renderWinHand();
	renderGoals();
}

function thereIsHoles() {
	for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
		for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
			if (gameState.grid[x][y] === 0) return true;
		}
	}
	return false;
}

function fillGrid(init = false) {
	// Stop refilling if the game is already over
	if (!init && (gameState.movesLeft < 1 || testWin())) {
		return;
	}
	let shifted = false;
	while (thereIsHoles()) {
		for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
			for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
				if (gameState.grid[x][y] === 0) {
					if (y !== 0) {
						gameState.grid[x][y] = gameState.grid[x][y - 1];
						gameState.grid[x][y - 1] = 0;
					} else {
						gameState.grid[x][y] = Math.floor(Math.random() * 6) + 1;
					}
				}
			}
		}
		shifted = true;
		if (init) {
			testGrid(init);
		} else {
			setTimeout(() => testGrid(false), 500);
		}
	}
	renderGrid();
}

function takeOffState(positionX, positionY, number, direction) {
	const dieVal = gameState.grid[positionX][positionY];
	if (dieVal !== 0) {
		addWinHand(dieVal);
	}
	for (let i = 0; i < number; i++) {
		if (direction === "hor") {
			gameState.grid[positionX + i][positionY] = 0;
		} else {
			gameState.grid[positionX][positionY + i] = 0;
		}
	}
	renderGrid();
}

// Aligned Match Fly-Up Helpers
function getNextWinHandIndex() {
	const tempHand = [...gameState.winHand];
	if (tempHand[tempHand.length - 1] !== 0) {
		tempHand.shift();
		tempHand.push(0);
	}
	for (let i = 0; i < tempHand.length; i++) {
		if (tempHand[i] === 0) {
			return i;
		}
	}
	return 0;
}

function animateGridToWinHand(positionX, positionY, number, direction, dieVal, targetIdx) {
	return new Promise((resolve) => {
		const targetEl = document.getElementById(`win${targetIdx}`);
		if (!targetEl) {
			resolve();
			return;
		}

		const scale = getGameScale();
		const endRect = targetEl.getBoundingClientRect();
		const endOffset = {
			left: endRect.left + window.scrollX,
			top: endRect.top + window.scrollY
		};
		const targetWidth = targetEl.offsetWidth;
		const targetHeight = targetEl.offsetHeight;

		let completedCount = 0;
		const totalDice = number;

		for (let i = 0; i < number; i++) {
			const cx = (direction === "hor") ? positionX + i : positionX;
			const cy = (direction === "hor") ? positionY : positionY + i;

			const sourceEl = document.getElementById(`${cx}_${cy}`);
			if (!sourceEl) {
				completedCount++;
				if (completedCount === totalDice) resolve();
				continue;
			}

			const startRect = sourceEl.getBoundingClientRect();
			const startOffset = {
				left: startRect.left + window.scrollX,
				top: startRect.top + window.scrollY
			};
			const sourceWidth = sourceEl.offsetWidth;
			const sourceHeight = sourceEl.offsetHeight;

			// Hide original cell background
			sourceEl.style.backgroundImage = "none";

			// Create duplicate flying element
			const flying = document.createElement("div");
			flying.className = "flying-die-match";
			Object.assign(flying.style, {
				position: "absolute",
				left: `${startOffset.left}px`,
				top: `${startOffset.top}px`,
				width: `${sourceWidth * scale}px`,
				height: `${sourceHeight * scale}px`,
				backgroundImage: `url(${GAME_CONFIG.paths.diceImage(dieVal)})`,
				backgroundSize: "cover",
				backgroundRepeat: "no-repeat",
				backgroundPosition: "center",
				borderRadius: `${10 * scale}px`,
				border: `${2 * scale}px solid black`,
				boxShadow: `0 ${4 * scale}px ${15 * scale}px rgba(0, 0, 0, 0.6)`,
				zIndex: "1000",
				opacity: "1"
			});
			document.body.appendChild(flying);

			const anim = flying.animate([
				{
					left: `${startOffset.left}px`,
					top: `${startOffset.top}px`,
					width: `${sourceWidth * scale}px`,
					height: `${sourceHeight * scale}px`,
					transform: 'rotate(0deg)',
					opacity: 1
				},
				{
					left: `${endOffset.left}px`,
					top: `${endOffset.top}px`,
					width: `${targetWidth * scale}px`,
					height: `${targetHeight * scale}px`,
					transform: 'rotate(360deg)',
					opacity: 0.8
				}
			], {
				duration: 500,
				easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
			});

			anim.onfinish = () => {
				flying.remove();
				completedCount++;
				if (completedCount === totalDice) {
					resolve();
				}
			};
		}
	});
}

async function testGrid(init = false) {
	// Stop any match checking or cascades if we have no moves left or already won
	if (!init && (gameState.movesLeft < 1 || testWin())) {
		return false;
	}

	let bool = false;

	// Horizontal match detection
	const horMatches = [];
	for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
		let currentVal = gameState.grid[0][y];
		let num = 1;
		let startX = 0;

		for (let x = 1; x <= GAME_CONFIG.gridWidth; x++) {
			const testVal = (x < GAME_CONFIG.gridWidth) ? gameState.grid[x][y] : 0;

			if (currentVal !== 0 && testVal !== 0 && currentVal === testVal) {
				num++;
			} else {
				if (num >= 3) {
					horMatches.push({ startX, y, num, val: currentVal });
					bool = true;
				}
				startX = x;
				num = 1;
			}
			currentVal = testVal;
		}
	}

	// Vertical match detection
	const verMatches = [];
	for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
		let currentVal = gameState.grid[x][0];
		let num = 1;
		let startY = 0;

		for (let y = 1; y <= GAME_CONFIG.gridHeight; y++) {
			const testVal = (y < GAME_CONFIG.gridHeight) ? gameState.grid[x][y] : 0;

			if (currentVal !== 0 && testVal !== 0 && currentVal === testVal) {
				num++;
			} else {
				if (num >= 3) {
					verMatches.push({ x, startY, num, val: currentVal });
					bool = true;
				}
				startY = y;
				num = 1;
			}
			currentVal = testVal;
		}
	}

	if (bool) {
		if (init) {
			// Clear synchronously without animations during setup
			horMatches.forEach(m => takeOffState(m.startX, m.y, m.num, "hor"));
			verMatches.forEach(m => takeOffState(m.x, m.startY, m.num, "ver"));
			fillGrid(init);
			renderWinHand();
			testWinHand(init);
		} else {
			AudioManager.playSFX(AudioManager.audioDice);

			const animations = [];
			let currentSimulatedHand = [...gameState.winHand];

			function getSimulatedWinHandIndex() {
				if (currentSimulatedHand[currentSimulatedHand.length - 1] !== 0) {
					currentSimulatedHand.shift();
					currentSimulatedHand.push(0);
				}
				for (let i = 0; i < currentSimulatedHand.length; i++) {
					if (currentSimulatedHand[i] === 0) {
						return i;
					}
				}
				return 0;
			}

			horMatches.forEach(m => {
				const targetIdx = getSimulatedWinHandIndex();
				currentSimulatedHand[targetIdx] = m.val;

				for (let i = 0; i < m.num; i++) {
					gameState.grid[m.startX + i][m.y] = 0;
				}

				animations.push(animateGridToWinHand(m.startX, m.y, m.num, "hor", m.val, targetIdx));
				addWinHand(m.val);
			});

			verMatches.forEach(m => {
				const targetIdx = getSimulatedWinHandIndex();
				currentSimulatedHand[targetIdx] = m.val;

				for (let i = 0; i < m.num; i++) {
					gameState.grid[m.x][m.startY + i] = 0;
				}

				animations.push(animateGridToWinHand(m.x, m.startY, m.num, "ver", m.val, targetIdx));
				addWinHand(m.val);
			});

			renderGrid();

			// Wait for all fly-up animations to complete
			await Promise.all(animations);

			renderWinHand();
			testWinHand(init);

			// Refill the grid
			setTimeout(() => fillGrid(false), 500);
		}
	} else {
		if (init) {
			fillGrid(init);
		} else {
			if (thereIsHoles()) {
				setTimeout(() => fillGrid(false), 500);
			}
		}
		renderWinHand();
		testWinHand(init);
	}

	return bool;
}

function canBeSwitched(x1, y1, x2, y2) {
	return ((Math.abs(x1 - x2) === 1 && y1 === y2) ||
		(Math.abs(y1 - y2) === 1 && x1 === x2));
}

async function play(x, y) {
	if (gameState.movesLeft < 1 || testWin() || isAnimating) return;

	if (!gameState.position1.set) {
		gameState.position1 = { x, y, set: true };
		const p1El = document.getElementById(`${x}_${y}`);
		if (p1El) p1El.classList.add("de_clicked");
	} else {
		if (gameState.position1.x === x && gameState.position1.y === y) {
			const p1El = document.getElementById(`${gameState.position1.x}_${gameState.position1.y}`);
			if (p1El) p1El.classList.remove("de_clicked");
			gameState.position1.set = false;
			return;
		}

		if (canBeSwitched(gameState.position1.x, gameState.position1.y, x, y)) {
			isAnimating = true;
			gameState.position2 = { x, y, set: true };

			const p1 = document.getElementById(`${gameState.position1.x}_${gameState.position1.y}`);
			const p2 = document.getElementById(`${gameState.position2.x}_${gameState.position2.y}`);

			if (!p1 || !p2) {
				isAnimating = false;
				gameState.position1.set = gameState.position2.set = false;
				return;
			}

			const val1 = gameState.grid[gameState.position1.x][gameState.position1.y];
			const val2 = gameState.grid[gameState.position2.x][gameState.position2.y];

			const left1 = gameState.position1.x * GAME_CONFIG.cellSize;
			const top1 = gameState.position1.y * GAME_CONFIG.cellSize;
			const left2 = gameState.position2.x * GAME_CONFIG.cellSize;
			const top2 = gameState.position2.y * GAME_CONFIG.cellSize;

			p1.style.zIndex = "15";
			p2.style.zIndex = "15";

			p1.classList.remove("de_clicked");
			p2.classList.remove("de_clicked");

			const pos1 = { x: gameState.position1.x, y: gameState.position1.y };
			const pos2 = { x: gameState.position2.x, y: gameState.position2.y };

			gameState.position1.set = gameState.position2.set = false;

			const anim1 = p1.animate([
				{ left: `${left1}px`, top: `${top1}px` },
				{ left: `${left2}px`, top: `${top2}px` }
			], { duration: 250, easing: "ease-in-out" });

			const anim2 = p2.animate([
				{ left: `${left2}px`, top: `${top2}px` },
				{ left: `${left1}px`, top: `${top1}px` }
			], { duration: 250, easing: "ease-in-out" });

			await Promise.all([anim1.finished, anim2.finished]);

			gameState.grid[pos1.x][pos1.y] = val2;
			gameState.grid[pos2.x][pos2.y] = val1;

			renderGrid();

			p1.style.zIndex = "";
			p2.style.zIndex = "";

			if (await testGrid()) {
				gameState.movesLeft--;
				document.getElementById("movesLeft").textContent = gameState.movesLeft;
				if (gameState.movesLeft < 1) {
					gameOver();
				}
				isAnimating = false;
			} else {
				p1.style.zIndex = "15";
				p2.style.zIndex = "15";

				const animBack1 = p1.animate([
					{ left: `${left2}px`, top: `${top2}px` },
					{ left: `${left1}px`, top: `${top1}px` }
				], { duration: 200, easing: "ease-in-out" });

				const animBack2 = p2.animate([
					{ left: `${left1}px`, top: `${top1}px` },
					{ left: `${left2}px`, top: `${top2}px` }
				], { duration: 200, easing: "ease-in-out" });

				await Promise.all([animBack1.finished, animBack2.finished]);

				gameState.grid[pos1.x][pos1.y] = val1;
				gameState.grid[pos2.x][pos2.y] = val2;

				renderGrid();

				p1.style.zIndex = "";
				p2.style.zIndex = "";
				isAnimating = false;
			}
		} else {
			const oldP1 = document.getElementById(`${gameState.position1.x}_${gameState.position1.y}`);
			if (oldP1) oldP1.classList.remove("de_clicked");
			
			gameState.position1 = { x, y, set: true };
			const newP1 = document.getElementById(`${x}_${y}`);
			if (newP1) newP1.classList.add("de_clicked");
		}
	}
}

// UI & Responsive Scaler
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
	document.body.classList.add("bypass-prompt");
	resizeGame();
}

function resizeGame() {
	const scaler = document.getElementById("game_scaler");
	const layout = document.getElementById("game_layout");
	if (!scaler || !layout) return;

	layout.style.transform = "";
	layout.style.transformOrigin = "";
	layout.style.margin = "";
	scaler.style.height = "";

	const unscaledWidth = layout.offsetWidth;
	const unscaledHeight = layout.offsetHeight;

	const padding = 20;
	const availableWidth = window.innerWidth - padding;
	const availableHeight = window.innerHeight - padding;

	const scaleX = availableWidth / unscaledWidth;
	const scaleY = availableHeight / unscaledHeight;

	let scale = Math.min(scaleX, scaleY);
	if (scale > 1.0) scale = 1.0;
	if (scale < 0.2) scale = 0.2;

	layout.style.transform = `scale(${scale})`;
	layout.style.transformOrigin = "top center";
	layout.style.margin = "0 auto";

	scaler.style.height = `${unscaledHeight * scale}px`;
}

// Highscores Posting & Rules UI handlers
function post_highscore() {
	const pseudoInput = document.getElementById("de_pseudo");
	let pseudo = pseudoInput ? pseudoInput.value : "";
	if (!pseudo || pseudo.trim() === "") {
		pseudo = "Anonymous";
		if (pseudoInput) pseudoInput.value = pseudo;
	}
	if (gameState.scoreFinal !== 0) {
		StorageManager.saveLocalHighscore(pseudo, gameState.scoreFinal);
	}
	const formHighscore = document.getElementById("form_highscore");
	if (formHighscore) formHighscore.style.display = "none";
	const tyPartage = document.getElementById("ty_partage");
	if (tyPartage) tyPartage.style.display = "block";
}

function showHighscoresMenu() {
	const scores = StorageManager.getHighscores();
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
	const infoEl = document.getElementById("info");
	if (infoEl) infoEl.innerHTML = html;
}

function showRulesMenu() {
	const infoEl = document.getElementById("info");
	if (infoEl) {
		infoEl.innerHTML = `<h3>INFO:</h3>
			<p>
				Choisissez un dé et permutez-le avec un dé voisin pour qu'un de ces deux dés touche un dé de valeur
				identique et forme une combinaison de trois dés ou plus de la même valeur. La valeur du dé est
				ensuite ajoutée à
				votre main.
			</p>
			<p>
				Le but du jeu est d'obtenir toutes les suites possibles (à droite -->).
			</p>`;
	}
}

// Initializer
document.addEventListener("DOMContentLoaded", function () {
	const formHighscore = document.getElementById("form_highscore");
	if (formHighscore) formHighscore.style.display = "none";
	const tyPartage = document.getElementById("ty_partage");
	if (tyPartage) tyPartage.style.display = "none";

	// Generate Board DOM
	const deArea = document.getElementById("de_area");
	if (deArea) {
		deArea.innerHTML = "";
		for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
			for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
				const div = document.createElement("div");
				Object.assign(div.style, {
					position: "absolute",
					left: `${x * GAME_CONFIG.cellSize}px`,
					top: `${y * GAME_CONFIG.cellSize}px`,
					width: `${GAME_CONFIG.cellSize}px`,
					height: `${GAME_CONFIG.cellSize}px`,
					display: "inline-block",
					backgroundImage: `url(${GAME_CONFIG.paths.diceImage(0)})`
				});
				div.id = `${x}_${y}`;
				div.addEventListener("click", () => play(x, y));
				deArea.appendChild(div);
			}
		}
	}

	resizeGame();

	let resizeTimeout;
	window.addEventListener("resize", function () {
		resizeGame();
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(resizeGame, 200);
	});
});

// Expose functions globally for HTML calls
window.play = play;
window.newGame = newGame;
window.post_highscore = post_highscore;
window.showHighscoresMenu = showHighscoresMenu;
window.showRulesMenu = showRulesMenu;
window.dismissRotationPrompt = dismissRotationPrompt;

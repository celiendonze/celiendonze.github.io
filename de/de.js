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
		$(`#brelan${i + 1} div`).css("opacity", brelan ? "1" : "0.4");
	});
	$("#doublePaire div").css("opacity", goal.doublePaire ? "1" : "0.5");
	$(".dp1").css("backgroundImage", `url(img/d_${goal.dp1 || 0}.png)`);
	$(".dp2").css("backgroundImage", `url(img/d_${goal.dp2 || "0b"}.png)`);
	$("#full div").css("opacity", goal.full ? "1" : "0.5");
	$(".full2").css("backgroundImage", `url(img/d_${goal.full2 || 0}.png)`);
	$(".full3").css("backgroundImage", `url(img/d_${goal.full3 || "0b"}.png)`);
	$("#carre div").css("opacity", goal.carre ? "1" : "0.5");
	$("#carre div").css("backgroundImage", `url(img/d_${goal.carrenum || 0}.png)`);
	$("#yahtzee div").css("opacity", goal.yahtzee ? "1" : "0.5");
	$("#yahtzee div").css("backgroundImage", `url(img/d_${goal.yahtzeenum || 0}.png)`);
	$("#score").text(game.score);
	if (testWin()) {
		audioWin.play();
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
		`<p>score: ${game.score}</p>
		 <p>+</p>
		 <p>coups restants: ${scoreinter}</p>
		 <p>=</p>
		 <p>Score final: ${game.scoreFinal}</p>`
	);
	$("#menu").show();
	$("#form_highscore").show();
}

// New Game
function newGame() {
	initGame();
	createGrid();
	testGrid(true);
	initGame();
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
	audioCoin[randNum].play();
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
			takeOffWinHand(i + 1, 3);
		}
	});

	setWinHand();
	setGoals();
}

// Check for holes in grid
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
	// Horizontal
	for (let y = 0; y < GRID_HEIGHT; y++) {
		let img = $(`#0_${y}`).css("backgroundImage");
		let num = 1;
		win.x = 0;
		win.y = y;
		for (let x = 1; x <= GRID_WIDTH; x++) {
			const testimg = $(`#${x}_${y}`).css("backgroundImage");
			if (img === testimg) {
				num++;
			} else {
				if (num >= 3) {
					takeOff(win.x, win.y, num, "hor");
					if (!init) audioDice.play();
					bool = true;
				}
				win.x = x;
				num = 1;
			}
			img = testimg;
		}
	}
	// Vertical
	for (let x = 0; x < GRID_WIDTH; x++) {
		let img = $(`#${x}_0`).css("backgroundImage");
		let num = 1;
		win.x = x;
		win.y = 0;
		for (let y = 1; y <= GRID_HEIGHT; y++) {
			const testimg = $(`#${x}_${y}`).css("backgroundImage");
			if (img === testimg) {
				num++;
			} else {
				if (num >= 3) {
					takeOff(win.x, win.y, num, "ver");
					if (!init) audioDice.play();
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
	if (!position1.set) {
		position1 = { x, y, set: true };
		$(`#${x}_${y}`).addClass("de_clicked");
	} else if (!position2.set) {
		position2 = { x, y, set: true };
		$(`#${x}_${y}`).addClass("de_clicked");
	}
	if (position1.set && position2.set) {
		const img1 = $(`#${position1.x}_${position1.y}`).css("backgroundImage");
		const img2 = $(`#${position2.x}_${position2.y}`).css("backgroundImage");
		if (canBeSwitched(position1.x, position1.y, position2.x, position2.y)) {
			$(`#${position1.x}_${position1.y}`).css("backgroundImage", img2);
			$(`#${position2.x}_${position2.y}`).css("backgroundImage", img1);
		}
		$(`#${position1.x}_${position1.y}`).removeClass("de_clicked");
		$(`#${position2.x}_${position2.y}`).removeClass("de_clicked");
		position1.set = position2.set = false;
		if (!testGrid()) {
			$(`#${position1.x}_${position1.y}`).css("backgroundImage", img1);
			$(`#${position2.x}_${position2.y}`).css("backgroundImage", img2);
		} else {
			game.movesLeft--;
			$("#movesLeft").text(game.movesLeft);
			if (game.movesLeft < 1) gameOver();
		}
	}
}

// Highscore post
function post_highscore() {
	const today = Math.floor(Date.now() / 1000);
	if ($("#de_pseudo").val() === "") $("#de_pseudo").val("Anonymous");
	if (game.scoreFinal !== 0) {
		$.post("php/de_post.php", {
			de_pseudo: $("#de_pseudo").val(),
			de_score: game.scoreFinal,
			de_date: today
		});
	}
	$("#form_highscore").hide();
	$("#ty_partage").show();
}

// UI setup
$(function () {
	const menuPosition = $("#win_area").offset();
	$("#menu").offset(menuPosition);
	$("#goal_area").css({
		left: menuPosition.left + 810,
		top: menuPosition.top
	});
	$("#form_highscore, #ty_partage").hide();

	// Create grid elements
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
});

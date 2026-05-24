// Custom assertion helper
function assert(condition, message) {
	if (!condition) {
		throw new Error(message || "Assertion failed");
	}
}

// Running states
const tests = [
	{
		id: "test_init",
		name: "Initialisation du Jeu",
		fn: async () => {
			// Call initGame to prepare board state
			initGame();
			
			assert(gameState.score === 0, `Le score devrait être 0 (valeur actuelle: ${gameState.score})`);
			assert(gameState.movesLeft === GAME_CONFIG.initialMoves, `Les coups restants devraient être ${GAME_CONFIG.initialMoves} (valeur actuelle: ${gameState.movesLeft})`);
			assert(gameState.winHand.every(v => v === 0), "La main gagnante devrait être remplie de 0");
			
			const goal = gameState.goal;
			assert(goal.brelan.every(b => b === false), "Tous les brelans devraient être à false");
			assert(goal.doublePaire === false, "Double Paire devrait être false");
			assert(goal.full === false, "Full devrait être false");
			assert(goal.carre === false, "Carré devrait être false");
			assert(goal.yahtzee === false, "Yahtzee devrait être false");
		}
	},
	{
		id: "test_swapping",
		name: "Validation de Permutation",
		fn: async () => {
			// Adjacent swaps
			assert(canBeSwitched(0, 0, 1, 0) === true, "Permutation horizontale adjacente devrait être valide");
			assert(canBeSwitched(0, 0, 0, 1) === true, "Permutation verticale adjacente devrait être valide");
			
			// Non-adjacent swaps
			assert(canBeSwitched(0, 0, 2, 0) === false, "Permutation non-adjacente (distance 2) devrait être invalide");
			assert(canBeSwitched(0, 0, 0, 2) === false, "Permutation non-adjacente (distance 2) devrait être invalide");
			assert(canBeSwitched(0, 0, 1, 1) === false, "Permutation diagonale (distance 1,1) devrait être invalide");
			assert(canBeSwitched(0, 0, 0, 0) === false, "Permutation avec soi-même devrait être invalide");
		}
	},
	{
		id: "test_goal_brelan",
		name: "Objectif: Brelan",
		fn: async () => {
			initGame();
			
			// Set hand to have a Brelan of 3s
			gameState.winHand = [3, 3, 3, 0, 0, 0, 0];
			
			testWinHand();
			
			// Brelan of 3s (index 2) should be true
			assert(gameState.goal.brelan[2] === true, "Le Brelan de 3 devrait être validé");
			assert(gameState.goal.brelan[0] === false, "Les autres brelans ne devraient pas être validés");
			
			// Brelan of 3s should be taken off the hand (replaced with 0s)
			assert(gameState.winHand.filter(x => x === 3).length === 0, "Les 3 dés de la main devraient être retirés");
		}
	},
	{
		id: "test_goal_double_paire",
		name: "Objectif: Double Paire",
		fn: async () => {
			initGame();
			
			// Set hand to have Double Pair of 1s and 2s
			gameState.winHand = [1, 1, 2, 2, 0, 0, 0];
			
			testWinHand();
			
			assert(gameState.goal.doublePaire === true, "La Double Paire devrait être validée");
			assert(gameState.goal.dp1 === 1 && gameState.goal.dp2 === 2, "Les numéros de paire devraient être 1 et 2");
			
			// Hand should be cleared
			assert(gameState.winHand.filter(x => x !== 0).length === 0, "La main devrait être vidée après validation");
		}
	},
	{
		id: "test_goal_full",
		name: "Objectif: Full House",
		fn: async () => {
			initGame();
			
			// Set hand to have Full of 4s (brelan) and 5s (paire)
			gameState.winHand = [4, 4, 4, 5, 5, 0, 0];
			
			testWinHand();
			
			assert(gameState.goal.full === true, "Le Full House devrait être validé");
			assert(gameState.goal.full3 === 4, "Le brelan du Full devrait être de valeur 4");
			assert(gameState.goal.full2 === 5, "La paire du Full devrait être de valeur 5");
			
			assert(gameState.winHand.filter(x => x !== 0).length === 0, "La main devrait être vidée");
		}
	},
	{
		id: "test_goal_carre",
		name: "Objectif: Carré",
		fn: async () => {
			initGame();
			
			// Set hand to have Carre of 6s
			gameState.winHand = [6, 6, 6, 6, 0, 0, 0];
			
			testWinHand();
			
			assert(gameState.goal.carre === true, "Le Carré devrait être validé");
			assert(gameState.goal.carrenum === 6, "Le carré devrait être constitué de 6");
			
			assert(gameState.winHand.filter(x => x !== 0).length === 0, "La main devrait être vidée");
		}
	},
	{
		id: "test_goal_yahtzee",
		name: "Objectif: Yahtzee",
		fn: async () => {
			initGame();
			
			// Set hand to have Yahtzee of 5s
			gameState.winHand = [5, 5, 5, 5, 5, 0, 0];
			
			testWinHand();
			
			assert(gameState.goal.yahtzee === true, "Le Yahtzee devrait être validé");
			assert(gameState.goal.yahtzeenum === 5, "Le Yahtzee devrait être de valeur 5");
			
			assert(gameState.winHand.filter(x => x !== 0).length === 0, "La main devrait être vidée");
		}
	},
	{
		id: "test_grid_horizontal",
		name: "Alignement Horizontal",
		fn: async () => {
			initGame();
			
			// Setup horizontal match of 5s
			// Fill grid with mathematically sterile values where shifting will never cascade
			for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
				for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
					gameState.grid[x][y] = (x + y) % 6 + 1;
				}
			}
			
			// Inject 3 aligned 5s horizontally
			gameState.grid[3][2] = 5;
			gameState.grid[4][2] = 5;
			gameState.grid[5][2] = 5;
			
			// Call testGrid in init (synchronous/no-anim) mode to test the raw logic instantly
			const matched = await testGrid(true);
			
			assert(matched === true, "L'alignement horizontal de 3 dés identiques devrait renvoyer true");
			assert(gameState.winHand.includes(5), "Le chiffre de l'alignement (5) devrait être ajouté à la main");
		}
	},
	{
		id: "test_grid_vertical",
		name: "Alignement Vertical",
		fn: async () => {
			initGame();
			
			// Fill grid with sterile distinct values
			for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
				for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
					gameState.grid[x][y] = (x + y) % 6 + 1;
				}
			}
			
			// Inject 3 aligned 4s vertically
			gameState.grid[2][3] = 4;
			gameState.grid[2][4] = 4;
			gameState.grid[2][5] = 4;
			
			const matched = await testGrid(true);
			
			assert(matched === true, "L'alignement vertical de 3 dés identiques devrait renvoyer true");
			assert(gameState.winHand.includes(4), "Le chiffre de l'alignement (4) devrait être ajouté à la main");
		}
	},
	{
		id: "test_grid_lshape",
		name: "Alignement en Forme de L",
		fn: async () => {
			initGame();
			
			// Fill grid with sterile distinct values
			for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
				for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
					gameState.grid[x][y] = (x + y) % 6 + 1;
				}
			}
			
			// Inject L-shape of 6s sharing the corner at (3, 3)
			// Horizontal arm: (1, 3), (2, 3), (3, 3)
			// Vertical arm: (3, 1), (3, 2), (3, 3)
			gameState.grid[1][3] = 6;
			gameState.grid[2][3] = 6;
			gameState.grid[3][3] = 6; // Corner
			gameState.grid[3][1] = 6;
			gameState.grid[3][2] = 6;

			const matched = await testGrid(true);
			
			assert(matched === true, "L'alignement en L de dés identiques devrait renvoyer true");
			
			// Count how many 6s are added to the win hand
			const winHandSixes = gameState.winHand.filter(x => x === 6).length;
			
			assert(winHandSixes === 2, `L'alignement en L devrait ajouter exactement 2 dés de valeur 6 à la main (valeur actuelle: ${winHandSixes})`);
		}
	}
];

async function runAllTests() {
	const runBtn = document.getElementById("run_btn");
	const progressBar = document.getElementById("progress_bar");
	const summaryCount = document.getElementById("summary_count");
	const summaryStatus = document.getElementById("summary_status");
	
	runBtn.disabled = true;
	runBtn.textContent = "Exécution...";
	progressBar.className = "progress-bar";
	progressBar.style.width = "0%";
	
	summaryStatus.textContent = "Exécution...";
	summaryStatus.className = "status-pass";
	
	let passCount = 0;
	let failCount = 0;
	
	// Reset all test badges to pending
	tests.forEach(t => {
		const badge = document.getElementById(`badge_${t.id}`);
		badge.className = "test-result-badge badge-pending";
		badge.textContent = "Attente";
	});
	
	const startTime = performance.now();
	
	for (let i = 0; i < tests.length; i++) {
		const t = tests[i];
		const badge = document.getElementById(`badge_${t.id}`);
		badge.textContent = "En cours";
		
		// Small delay to make execution visible and smooth
		await new Promise(r => setTimeout(r, 100));
		
		try {
			await t.fn();
			badge.textContent = "Pass";
			badge.className = "test-result-badge badge-pass";
			passCount++;
		} catch (err) {
			console.error(`Test failed: ${t.name}`, err);
			badge.textContent = "Fail";
			badge.className = "test-result-badge badge-fail";
			failCount++;
		}
		
		// Update progress
		const progress = ((i + 1) / tests.length) * 100;
		progressBar.style.width = `${progress}%`;
		summaryCount.innerHTML = `Tests: <span>${passCount + failCount} / ${tests.length}</span>`;
		
		if (failCount > 0) {
			progressBar.classList.add("fail");
			summaryStatus.textContent = "Échec";
			summaryStatus.className = "status-fail";
		}
	}
	
	const totalTime = ((performance.now() - startTime) / 1000).toFixed(2);
	
	if (failCount === 0) {
		summaryStatus.textContent = "Réussite";
		summaryStatus.className = "status-pass";
	} else {
		summaryStatus.textContent = "Échec";
		summaryStatus.className = "status-fail";
	}
	
	runBtn.disabled = false;
	runBtn.textContent = "Lancer les Tests";
	
	console.log(`Test Run Completed: ${passCount} passed, ${failCount} failed in ${totalTime}s`);
}

// Run automatically on load
window.addEventListener("load", () => {
	setTimeout(runAllTests, 500);
});

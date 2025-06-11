<?php

	$pagename = "Snake";

	$pageclass = "Games";

	include "/home/u504351183/public_html/part/header.php";

	



?>	

			<link rel="stylesheet" href="/snake/snake.css">

			<section>

				

				<div id="snakeGame">

					<div id="world">

						<div id="gameoverWindow">							

							<p>GAME OVER <br><br> SCORE: <span id="scoreGameover">0</span></p>

							<form action="../highscores.php" method="post">

								<label for="player">Player Name:</label>

								<input type="text" id="player" name="player" value="Anonymous" required></input>

								<input type="hidden" id="number" name="number"></input>

								<input type="hidden" id="date" name="date"></input>

								<input type="submit" class="btn" name="submit" value="Submit and See Scores"></input>

							</form>

							<div id="closeGameOver" onclick="newGame()"></div>

						</div>

					</div>

					

					<div id="menu"> 

						<div class="unSelectable" id="btnOptions" onclick="option()">

							<p>Options</p>

						</div>

						

						<div class="unSelectable" id="btnPlay" onclick="newGame()">

							<p>New Game</p>

						</div>

						

						<div id="scoreDiv">

							<p>SCORE: <span id="score">0</span></p>

						</div>

						

						<div id="bestScores">

							<div id="highScores">

								<p>HighScores</p>

							</div>

							<ol id="listScores">

								

							</ol>

						</div>

						<div class="unSelectable" id="btnPause" onclick="playOnOff()">

							<p>PAUSE</p>

						</div>

					</div>

					

					<div id="options">

						<div class="optionsWindow colorWindow">

							<div class="snakeColor" id="original" onclick="changecolor(0)">

								<div class="colorHead"></div>

							</div>

							<div class="snakeCd="blackAndWhite" onclick="changecolor(1)">

								<div class="colorHead"></div>

							</div>

							<div class="snakeColor" id="flash" onclick="changecolor(2)">

								<div class="colorHead"></div>

							</div>

							<div class="snakeColor" id="iceCream" onclick="changecolor(3)">

								<div class="colorHead"></div>

							</div>

						</div>

						

						<div class="optionsWindow speedWindow">

							<p>Speed:</p>

							<div class="unSelectable btnSpeed" id="btnSpeed1" onclick="setSpeed(1)">Slow</div>

							<div class="unSelectable btnSpeed" id="btnSpeed2" onclick="setSpeed(2)">Normal</div>	

							<div class="unSelectable btnSpeed" id="btnSpeed3" onclick="setSpeed(3)">Fast</div>

						</div>

						

						<div class="optionsWindow wallsWindow">

							<div class="unSelectable" id="btnWalls" onclick="toggleWalls()">

								<p>Walls ON<p>

							</div>

						</div>

						

						

						<div class="optionsWindow cmdWindow">

							<div class="groupCmd">

								<div>Left: </div><div class="unSelectable" id="cmdLeft" onclick="setCmd(0)">leftARR</div>

							</div>

							

							<div class="groupCmd">

								<div>Up: </div><div class="unSelectable" id="cmdUp" onclick="setCmd(1)">upARR</div>

							</div>

							

							<div class="groupCmd">

								<div>Right: </div><div class="unSelectable" id="cmdRight" onclick="setCmd(2)">rightARR</div>

							</div>

							

							<div class="groupCmd">

								<div>Down: </div><div class="unSelectable" id="cmdDown"  onclick="setCmd(3)">downARR</div>

							</div>

						</div>

						

						<div class="optionsWindow">

							<div id="btnBot" onclick="autoMove()">

								AutoPlay

							</div>

						</div>

						

						<p id="copyright">&copy Lorkii 2016</p>

					</div>

				</div>		

            </section>

            

			<script src="/snake/jquery-2.2.0.js"></script>

			<script src="/snake/jquery-ui.js"></script>

            <script src="/snake/script.js"></script>    

<?php

	

	include "/home/u504351183/public_html/part/footer.php";

	

?>	
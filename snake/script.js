color ={
	apple : "rgb(217, 83, 79)",
	snake : "rgb(100, 200, 0)",
	head : "rgb(66, 139, 202)",
	world : "rgb(255, 255, 200)"
}

colorOriginal ={
	apple : "rgb(217, 83, 79)",
	snake : "rgb(100, 200, 0)",
	head : "rgb(66, 139, 202)",
	world : "rgb(255, 255, 200)"
}	

colorBW ={
	apple : "rgb(0, 0, 0)",
	snake : "rgb(151, 151, 151)",
	head : "rgb(123, 125, 123)",
	world : "rgb(191, 192, 193)"
}	

colorFlash ={
	apple : "rgb(255, 0, 0)",
	snake : "rgb(0, 255, 0)",
	head : "rgb(0, 0, 255)",
	world : "rgb(255, 255, 66)"
}	

colorIceCream ={
	apple : "rgb(253, 245, 201)",
	snake : "rgb(194, 242, 208)",
	head : "rgb(255, 197, 217)",
	world : "rgb(107, 62, 38)"
}

//commandes de base
var cmdLeft = 37;
var cmdUp = 38;
var cmdRight = 39;
var cmdDown = 40;

//positions du snake
var snakeSize = 0;
var snakeX = 15;
var snakeY = 15;
var secondX = 0;
var secondY = 0;
var lastX = [15];
var lastY = [15];
var appleX;
var appleY;
var direction = "";
var scoreSpeed = 2;
var gameoverTest = false;
var play = false;
var canMove = true;
var walls = true;

//permettre l'association de touches
var leftCmd = false;
var upCmd = false;
var rightCmd = false;
var downCmd = false;

//p5 controls

let speechRec;
function setup() {
  noCanvas();
  speechRec = new p5.SpeechRec(navigator.language, callBack);
  console.log("ready.");

  function callBack(){
    if(speechRec.resultValue){
      createP(speechRec.resultString);
    }
  }
}

function start(){
  speechRec.start(true,false);
}

















var score = 0;

var bestScores = [];

load();
setHighScore();

//interval de mouvement
var movement;
setSpeed(2);



//cacher les options
$("#options").hide();

//creation des divs
for(var x=0;x<30;x++){
	for(var y=0;y<30;y++){
		$(document.createElement("div"))
			.addClass("area")
			.css({
				position: "absolute",
				left: (x*20),
				top: (y*20),
				width: "20px",
				height: "20px",
				display: "inline-block"
			})
			.attr("id", x+"_"+y)
			.appendTo($("#world"));
	}
}

newGame();

//nouvelle pomme
function newApple(){
	var randX = Math.ceil(Math.random()*29);
	var randY = Math.ceil(Math.random()*29);
	if($("#"+randX+"_"+randY).css("background-color") == color.world){
			$("#"+randX+"_"+randY).css("background-color", color.apple);
			console.log("new apple");
			appleX = randX;
			appleY = randY;
	}else{
		newApple();
	}
}	

//game over: arrete le serpent et montre la fenetre de score
function gameover(){
	snakeSize = lastX.length;
	deathAnimation();
	snakeX=secondX;
	snakeY=secondY;
	play = false;
	console.log("gameover");
	gameoverTest = true;
	$("#gameoverWindow").css({opacity: 1});

	$("#scoreGameover").text(score);
	
	$("#number").val(score);
	var today = new Date();
	var formatToday = today.getTime();
	$("#date").val(parseInt(formatToday/1000));
	$("#player").select();
	
	if(!bestScores){
		bestScores = [];
	}
	
	bestScores.push(score);
	
	setHighScore()
	
}


function setHighScore(){
	if(bestScores){
		bestScores.sort(function(a, b){return b-a});
		$("#listScores").empty();
		for(var i=0;i<bestScores.length && i<10;i++){
			$("#listScores").append("<li>"+bestScores[i]+"</li>");
		}
		save();
	}
}

//utilisée uniquement par le bouton pause	
function playOnOff(){
	if(!gameoverTest && !autoMovePlay){
		if(play){
			play = false;
			$("#btnPause").css("height","50px");
		}else{
			play = true;
			$("#btnPause").css("height","60px");
		}
	}
}

//reset le jeu
function reset(){
	for(var x=0;x<30;x++){
		for(var y=0;y<30;y++){
			$("#"+x+"_"+y).css("background-color", color.world);
		}
	}
	
	snakeSize = 0;
	direction = "";
	snakeX = [15];
	snakeY = [15];
	lastX = [15];
	lastY = [15];
	score = 0;
	play = false;
	canMove = true;
	$("#score").text(0);
	gameoverTest = false;
}

//bouger la tete, fonction qui tourne en intervals
function move(){
	
	
	secondX=snakeX;
	secondY=snakeY;
	
	
	switch(direction){
		case "left":
				snakeX--;
			break;
			
		case "up" : 
				snakeY--;
			break;
		
		case "right" : 
				snakeX++;
			break;
		
		case "down" : 
				snakeY++;
			break;
	}
	
	follow();
	
	
	//permet de changer de sens, empeche de se mordre la queue en spammant les touches
	canMove = true;
	
}

function follow(){
	if(!walls){
		if(snakeX < 0){
			snakeX = 29;
		}else if(snakeX > 29){
			snakeX = 0;
		}
		
		if(snakeY < 0){
			snakeY = 29;
		}else if(snakeY > 29){
			snakeY = 0;
		}
	}else if(snakeX<0 || snakeX>29 || snakeY<0 || snakeY>29){
		gameover();
	}
	
	
	
	if($("#"+snakeX+"_"+snakeY).css("background-color") == color.snake){
		gameover();
	}
	
	if(	$("#"+snakeX+"_"+snakeY).css("background-color") == color.world || 
		$("#"+snakeX+"_"+snakeY).css("background-color") == color.apple){
			if($("#"+snakeX+"_"+snakeY).css("background-color") == color.apple){
				score += scoreSpeed;
				$("#score").text(score);
				newApple();
				//console.log("scored!");
				
			}else{
				$("#"+lastX[lastX.length-1]+"_"+lastY[lastX.length-1]).css("background-color", color.world);
				lastX.pop();
				lastY.pop();	
			}
			
			lastX.unshift(secondX);
			lastY.unshift(secondY);
			
			
			$("#"+snakeX+"_"+snakeY).css("background-color", color.head);
			$("#"+secondX+"_"+secondY).css("background-color", color.snake);
	}
}

//lance une nouvelle partie
function newGame(){
	$("#gameoverWindow").css({opacity: 0});
	reset();
	$("#15_15").css("background-color", color.head);
	newApple();
}

function option(){
	$("#options").toggle("slide");
}

function changecolor(nbrColor){
	switch(nbrColor){
		case 0: 
				color = colorOriginal;
				break;
		case 1: 
				color = colorBW;
				break;
		case 2: 
				color = colorFlash;
				break;
		case 3: 
				color = colorIceCream;
				break;
	}
	
	reColor();
}

function reColor(){
	for(var x=0;x<30;x++){
		for(var y=0;y<30;y++){
			$("#"+x+"_"+y).css("background-color", color.world);
		}
	}
	$("#"+appleX+"_"+appleY).css("background-color", color.apple);
	
	for(var i=0;i<lastX.length;i++){	
		$("#"+lastX[i]+"_"+lastY[i]).css("background-color", color.snake);
	}
	$("#"+snakeX+"_"+snakeY).css("background-color", color.head);
}

function toggleWalls(){
	if(walls){
		walls = false;
		$("#btnWalls").html("<p>Walls OFF<p>");
		$("#world").css("border-style", "dashed");
	}else{
		walls = true;
		$("#btnWalls").html("<p>Walls ON<p>");
		$("#world").css("border-style", "solid");
	}
}

function setCmd(nbr){
	switch(nbr){
		case 0:
				leftCmd = true;
				$("#cmdLeft").text("New?");
				break;
		case 1:
				upCmd = true;
				$("#cmdUp").text("New?");
				break;
		case 2:
				rightCmd = true;
				$("#cmdRight").text("New?");
				break;
		case 3:
				downCmd = true;
				$("#cmdDown").text("New?");
				break;		
	}
}

function setSpeed(nbr){
	$("#btnSpeed1").css("background-color","");
	$("#btnSpeed2").css("background-color","");
	$("#btnSpeed3").css("background-color","");
	switch(nbr){
		case 1:
				clearInterval(movement);
				movement = setInterval(function(){ if(play){move();} },160);
				scoreSpeed = 1;
				$("#btnSpeed1").css("background-color","#3D8649");
				break;
		case 2:
				clearInterval(movement);
				movement = setInterval(function(){ if(play){move();} },120);
				scoreSpeed = 2;
				$("#btnSpeed2").css("background-color","#3D8649");
				break;
		case 3:
				clearInterval(movement);
				movement = setInterval(function(){ if(play){move();} },80);
				scoreSpeed = 3;
				$("#btnSpeed3").css("background-color","#3D8649");
				break;		
	}
}

function save(){
	var save = bestScores;
	save.slice(0,10);
	localStorage.setItem("saveSnake", JSON.stringify(save));
}

function load(){
	var load = JSON.parse(localStorage.getItem("saveSnake"));
	bestScores = load;
}



function randomBot(){
	
	var changeDirection;// = setInterval(function(){ randomInterval(); }, 500);
	var moving = setInterval(function(){ botMove(); }, 100);
	var lastDirection;
	var botRandMove;
	var randInterval;
	
	randomInterval();
	
	function randomInterval(){
		randInterval = (Math.floor(Math.random()*5)+1)*100;
		clearInterval(changeDirection);
		changeDirection = setInterval(function(){ 	botDirection();
													randomInterval();
						}, randInterval);
	}
	
	function botDirection(){
		botRandMove = Math.floor(Math.random()*4);
		console.log(botRandMove);
		
		lastDirection = botRandMove;
	}
	
	function botMove(){
		
		secondX=snakeX;
		secondY=snakeY;
		
		switch(botRandMove){
			case 0: //left
					if(lastDirection != 2 && $("#"+(snakeX-1)+"_"+(snakeY)).css("background-color") == color.world || $("#"+(snakeX-1)+"_"+(snakeY)).css("background-color") == color.apple){
						snakeX--;
					}else{
						botDirection();
						botMove();
					}
					break;
					
			case 1: //up
					if(lastDirection != 3 && $("#"+(snakeX)+"_"+(snakeY-1)).css("background-color") == color.world || $("#"+(snakeX)+"_"+(snakeY-1)).css("background-color") == color.apple){
						snakeY--;
					}else{
						botDirection();
						botMove();
					}
					break;
					
			case 2: //right
					if(lastDirection != 0 && $("#"+(snakeX+1)+"_"+(snakeY)).css("background-color") == color.world || $("#"+(snakeX+1)+"_"+(snakeY)).css("background-color") == color.apple){
						snakeX++;
					}else{
						botDirection();
						botMove();
					}
					break;
					
			case 3: // down
					if(lastDirection != 1 && $("#"+(snakeX)+"_"+(snakeY+1)).css("background-color") == color.world || $("#"+(snakeX)+"_"+(snakeY+1)).css("background-color") == color.apple){
						snakeY++;
					}else{
						botDirection();
						botMove();
					}
					break;		
		}
		
		follow();
	}
}


var autoMovePlay = false;
var autoPlayInterval;

function autoMove(){
	var direc = "x";
	
	play = false;
	$("#btnPause").css("height","50px");
	
	if(autoMovePlay && !gameoverTest){
		autoMovePlay = false;
		$("#btnBot").css("background-color", "#5BC96E");
	}else if(!gameoverTest){
		autoMovePlay = true;
		$("#btnBot").css("background-color", "#3D8649");
	}
	
	clearInterval(autoPlayInterval);
	
	autoPlayInterval = setInterval(function(){
		if(autoMovePlay){goToApple(direc);};
	}, 100);


	function randomMove(){
		var botRandMove = Math.floor(Math.random()*4);
	
		botMove();
	
		
		function botMove(){
			
			secondX=snakeX;
			secondY=snakeY;
			
				
			
			switch(botRandMove){
				case 0: //left
						if(	$("#"+(snakeX-1)+"_"+(snakeY)).css("background-color") == color.world || 
							$("#"+(snakeX-1)+"_"+(snakeY)).css("background-color") == color.apple){
							snakeX--;
							direction = "left";
						}else{
							randomMove();
						}
						break;
						
				case 1: //up
						if(	$("#"+(snakeX)+"_"+(snakeY-1)).css("background-color") == color.world || 
							$("#"+(snakeX)+"_"+(snakeY-1)).css("background-color") == color.apple){
							snakeY--;
							direction = "up";
						}else{
							randomMove();
						}
						break;
						
				case 2: //right
						if(	$("#"+(snakeX+1)+"_"+(snakeY)).css("background-color") == color.world || 
							$("#"+(snakeX+1)+"_"+(snakeY)).css("background-color") == color.apple){
							snakeX++;
							direction = "right";
						}else{
							randomMove();
						}
						break;
						
				case 3: // down
						if(	$("#"+(snakeX)+"_"+(snakeY+1)).css("background-color") == color.world || 
							$("#"+(snakeX)+"_"+(snakeY+1)).css("background-color") == color.apple){
							snakeY++;
							direction = "down";
						}else{
							randomMove();
						}
						break;		
			}
			
			follow();
				
		}
	}

	function goToApple(direcp){
		
		secondX=snakeX;
		secondY=snakeY;
		
		
		switch(direcp){
			case "x":
			
					
					
					if(snakeX < appleX && $("#"+(snakeX+1)+"_"+(snakeY)).css("background-color") == color.world || 
										$("#"+(snakeX+1)+"_"+(snakeY)).css("background-color") == color.apple){
						
						if($("#"+(snakeX+1)+"_"+(snakeY)).css("background-color") == color.apple){
							direc = "y";
						}
						
						snakeX++;
						direction = "right";
						follow();
					}else if(snakeX > appleX && $("#"+(snakeX-1)+"_"+(snakeY)).css("background-color") == color.world || 
										$("#"+(snakeX-1)+"_"+(snakeY)).css("background-color") == color.apple){
						
						if($("#"+(snakeX-1)+"_"+(snakeY)).css("background-color") == color.apple){
							direc = "y";
						}
						
						snakeX--;
						direction = "left";
						follow();
					}else if(snakeY < appleY && $("#"+(snakeX)+"_"+(snakeY+1)).css("background-color") == color.world || 
										$("#"+(snakeX)+"_"+(snakeY+1)).css("background-color") == color.apple){
						
						if($("#"+(snakeX)+"_"+(snakeY+1)).css("background-color") == color.apple){
							direc = "y";
						}
						
						snakeY++;
						direction = "down";
						follow();
					}else if(snakeY > appleY && $("#"+(snakeX)+"_"+(snakeY-1)).css("background-color") == color.world || 
										$("#"+(snakeX)+"_"+(snakeY-1)).css("background-color") == color.apple){
						
						if($("#"+(snakeX)+"_"+(snakeY-1)).css("background-color") == color.apple){
							direc = "y";
						}
						
						snakeY--;
						direction = "up";
						follow();
					}else{
						randomMove();
					}
					
					
					
					
					break;
			
			case "y":
			
					
					
					if(snakeY < appleY && $("#"+(snakeX)+"_"+(snakeY+1)).css("background-color") == color.world || 
										$("#"+(snakeX)+"_"+(snakeY+1)).css("background-color") == color.apple){
						
						if($("#"+(snakeX)+"_"+(snakeY+1)).css("background-color") == color.apple){
							direc = "x";
						}	
						
						snakeY++;
						direction = "down";
						follow();
					}else if(snakeY > appleY && $("#"+(snakeX)+"_"+(snakeY-1)).css("background-color") == color.world || 
										$("#"+(snakeX)+"_"+(snakeY-1)).css("background-color") == color.apple){
						
						if($("#"+(snakeX)+"_"+(snakeY-1)).css("background-color") == color.apple){
							direc = "x";
						}
						
						snakeY--;
						direction = "up";
						follow();
					}else if(snakeX < appleX && $("#"+(snakeX+1)+"_"+(snakeY)).css("background-color") == color.world || 
										$("#"+(snakeX+1)+"_"+(snakeY)).css("background-color") == color.apple){
						
						if($("#"+(snakeX+1)+"_"+(snakeY)).css("background-color") == color.apple){
							direc = "x";
						}
						
						snakeX++;
						direction = "right";
						follow();
					}else if(snakeX > appleX && $("#"+(snakeX-1)+"_"+(snakeY)).css("background-color") == color.world || 
										$("#"+(snakeX-1)+"_"+(snakeY)).css("background-color") == color.apple){
						
						if($("#"+(snakeX-1)+"_"+(snakeY)).css("background-color") == color.apple){
							direc = "x";
						}
						
						snakeX--;
						direction = "left";
						follow();
					}else{
						randomMove();
					}
					
					
					
					break;
		}
	}
}

function randomColor(){
	
	var color = "#";
	
	var listHex = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
	
	for(var i=0;i<6;i++){
		
		var num = listHex[Math.floor(Math.random()*listHex.length)];
		
		color+=num;
		
	}
	
	return color;
}

function deathAnimation(){
	setTimeout(function(){
		var elem = $(document.getElementById(lastX[snakeSize]+"_"+lastY[snakeSize]));

		elem.css("background-color",randomColor());

		snakeSize--;
		if(snakeSize >= 0){
			deathAnimation();
		}
	
	}, 100);
	
		
}

function keyToString(key){
	var keyName = "";
	switch(key){
		case 37: keyName="leftARR";
		break;
		case 38:keyName="upARR";
		break;
		case 39:keyName="rightARR";
		break;
		case 40:keyName="downARR";
		break;
		
		default: keyName=String.fromCharCode(key);
	}
	return keyName;
}


//event listener click touche
$(document).keydown(function(e){
	
	switch(e.which){
		case 37: e.preventDefault();
		break;
		case 38: e.preventDefault();
		break;
		case 39: e.preventDefault();
		break;
		case 40: e.preventDefault();
		break;
	}
	
	
	
	//commandes du snake
	switch(e.which){
		//left
		case cmdLeft: 
					if(direction != "right" && direction != "left" && canMove){
						direction = "left";
						canMove = false;
					}
					if(!play && !gameoverTest && !autoMovePlay){
						play=true;
						$("#btnPause").css("height","60px");
					}
					break;
		
		//up
		case cmdUp:
					if(direction != "down" && direction != "up" && canMove){
						direction = "up";
						canMove = false;
					}
					if(!play && !gameoverTest && !autoMovePlay){
						play=true;
						$("#btnPause").css("height","60px");
					}
					break;

		//right
		case cmdRight:
					if(direction != "left" && direction != "right" && canMove){
						direction = "right";
						canMove = false;
					}
					if(!play && !gameoverTest && !autoMovePlay){
						play=true;
						$("#btnPause").css("height","60px");
					}
					break;
		
		//down
		case cmdDown:
					if(direction != "up" && direction != "down" && canMove){
						direction = "down";
						canMove = false;
					}
					if(!play && !gameoverTest && !autoMovePlay){
						play=true;
						$("#btnPause").css("height","60px");
					}
					break;
		//pause			
		case 32: 
					e.preventDefault();
					playOnOff();
					break;
		//nouvelle partie
		case 13: 
					newGame();
					break;
		
	}
	
	//association des touches
	if(leftCmd){
		cmdLeft = e.which;
		$("#cmdLeft").text(keyToString(e.which));
		leftCmd = false;
	}
	if(upCmd){
		cmdUp = e.which;
		$("#cmdUp").text(keyToString(e.which));
		upCmd = false;
	}
	if(rightCmd){
		cmdRight = e.which;
		$("#cmdRight").text(keyToString(e.which));
		rightCmd = false;
	}
	if(downCmd){
		cmdDown = e.which;
		$("#cmdDown").text(keyToString(e.which));
		downCmd = false;
	}
	
});


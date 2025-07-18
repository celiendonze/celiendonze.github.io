var c = document.getElementById("canvas");
var ctx = c.getContext("2d");


//creation d'un tableau 2d 80x80
var map = new Array(80);
for (var i = 0; i < 80; i++) {
  map[i] = new Array(80);
}

//tableau des couleurs
var color=[	"#abf0ff",
			"#81cfdb",	
			"#6393b6",
			"#9fdfff",
			"#518ed2"];

for(var i=0;i<color.length;i++){
	$("#choix"+i).css("backgroundColor",color[i]);
}


function changeColors(){
	for(var i=0;i<color.length;i++){
		color[i]="#" + $("#color"+i).val();
	}
	
	for(var x=0;x<80;x++){	
		for(var y=0;y<80;y++){
			ctx.fillStyle = color[map[x][y]];
			ctx.fillRect(x*10,y*10,10,10);
		}
	}
	
	for(var i=0;i<color.length;i++){
		$("#choix"+i).css("backgroundColor",color[i]);
	}
}			
			

var ant = {	
	x: 39,
	y: 39,
	direction: "up",
	moveLeft: function() {
		changeColor(this.x,this.y);
		switch(this.direction){
			case "up":
						this.x -= 1;
						this.direction = "left";
			break;
			case "down":
						this.x += 1;
						this.direction = "right";
			break;
			case "left":
						this.y += 1;
						this.direction = "down";
			break;
			case "right":
						this.y -= 1;
						this.direction = "up";
			break;
		}
	},
	moveRight: function() {
		changeColor(this.x,this.y);
		switch(this.direction){
			case "up":
						this.x += 1;
						this.direction = "right";
			break;
			case "down":
						this.x -= 1;
						this.direction = "left";
			break;
			case "left":
						this.y -= 1;
						this.direction = "up";
			break;
			case "right":
						this.y += 1;
						this.direction = "down";
			break;
		}
	},
	init: function(){
		this.x=39;
		this.y=39;
		this.direction="up";
		//init map to 0
		for(var x=0;x<80;x++){	
			for(var y=0;y<80;y++){
				map[x][y]=0;
			}
		}
		//init canvas color from map
		for(var x=0;x<80;x++){	
			for(var y=0;y<80;y++){
				ctx.fillStyle = color[map[x][y]];
				ctx.fillRect(x*10,y*10,10,10);
			}
		}
	}
}

ant.init();


//change la couleur et color le canvas
function changeColor(posX,posY){
	map[posX][posY]++;
	if(map[posX][posY]>4){
		map[posX][posY] = 0;
	}
	ctx.fillStyle = color[map[posX][posY]];
	ctx.fillRect(posX*10,posY*10,10,10);
}


//choix dans quel sens tourner à chaque couleur
var choix = {
	choixSens: ["left","left","right","left","right"],
	change: function(num){
		if(this.choixSens[num]=="left"){
			this.choixSens[num]="right";
			$("#choix"+num).css("backgroundImage","url(arrowRight.png)");
		}else{
			this.choixSens[num]="left";
			$("#choix"+num).css("backgroundImage","url(arrowLeft.png)");
		}
	}
}
$("#choix0").css("backgroundImage","url(arrowLeft.png)");
$("#choix1").css("backgroundImage","url(arrowLeft.png)");
$("#choix2").css("backgroundImage","url(arrowRight.png)");
$("#choix3").css("backgroundImage","url(arrowLeft.png)");
$("#choix4").css("backgroundImage","url(arrowRight.png)");




//main function qui fait bouger la fourmi
function move(){
	switch(map[ant.x][ant.y]){
		case 0:
				rotate(0);
		break;
		case 1:
				rotate(1);
		break;
		case 2:
				rotate(2);
		break;
		case 3:
				rotate(3);
		break;
		case 4:
				rotate(4);
		break;
	}
}

function rotate(num){
	if(choix.choixSens[num]=="left"){
		ant.moveLeft();
	}else{
		ant.moveRight();
	}
}

var mainInterval;
var vitesse=1;
function changeVitesse(){
	vitesse++;
	if(vitesse>3){
		vitesse=0;
	}
	
	switch(vitesse){
		case 0: clearInterval(mainInterval);
				mainInterval = setInterval(move, 500);
				$("#vitesse").text("vitesse: lent");
		break;
		case 1: clearInterval(mainInterval);
				mainInterval = setInterval(move, 200);
				$("#vitesse").text("vitesse: normal");
		break;
		case 2: clearInterval(mainInterval);
				mainInterval = setInterval(move, 50);
				$("#vitesse").text("vitesse: rapide");
		break;
		case 3: clearInterval(mainInterval);
				mainInterval = setInterval(move, 1);
				$("#vitesse").text("vitesse: tres rapide");
		break;
		
	}
}





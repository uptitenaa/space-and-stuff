//I found out that stars have a major impact on performance, so maybe i should do something about that
//Add title screen
//Launch game

var w; //The key controls
var a;
var d;
var s;
var space;
var f;

var socket;
var isMobile;
var stars; //An array of star vectors
var windowCamera; //A vector representing the windowCamera position
var gameScale; //A variable dictating the scale of the game
var players; //A dictionary (object that i am treating as a dictionary) containing all of the players
var playerList; //A list containing all players
var drones; //An array of drones
var bullets; //A dictionary of bullets
var particles; //A dictionary of particles
var myPlayer;
var gameHost;
var nameChoosen;
var imp; //The name text input box
var button;

var thisPlayer;

var allPlayers; //A dictionary containing all player objects (including drones)

var respawnTimer;
var miniMapTimer;

function setup() {
	socket = io.connect();
	socket.on("connect", conn);
	socket.on("re_player", re_player);
	socket.on("re_reqPlayer", re_reqPlayer);
	socket.on("discon", disconnect);
	socket.on("gameHost", recGameHost);
	socket.on("re_bullet", re_bullet);
	socket.on("re_effect", re_effect);
	createCanvas(windowWidth, windowHeight);
	frameRate(30);
	
	isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
	windowCamera = createVector(0, 0);
	gameScale = 1;
	width = width / gameScale;
	height = height / gameScale;
	miniMapTimer = 0;
	respawnTimer = 0;
	
	//The name selector
	nameChoosen = false;
	gameScale = 0.1;
	imp = createInput("");
	imp.center();
	imp.input(nameImput);
	button = createButton("Go!");
	button.center();
	button.position(button.x, imp.y + imp.height + 2);
	button.mousePressed(chooseName);
	
	//Player setup
	allPlayers = {};
	players = {};
	playerList = [];
	myPlayer = "";
	players[""] = new Player();
	function conn() {
		myPlayer = socket.id;
		players[myPlayer] = new Player(myPlayer, myPlayer);
		players[myPlayer].health = 0;
		delete players[""];
		delete allPlayers[""];
		thisPlayer = players[myPlayer];
	}
	
	//Drone, bullet, and particle setup
	drones = [];
	bullets = {};
	particles = {};
	
	//Set up the stars
	stars = [];
	for (let i = 0; i < (STAR_DENSITY * (GAME_SIZE * GAME_SIZE)); i++) {
		let tempDirection = random(0, TWO_PI);
		let tempMagnitude = GAME_SIZE * sqrt(random(0, 1)) / 2;
		let tempX = parseInt(tempMagnitude * cos(tempDirection));
		let tempY = parseInt(tempMagnitude * sin(tempDirection));
		stars[i] = createVector(tempX, tempY);
	}
}

function draw() {
	width = windowWidth / gameScale;
	height = windowHeight / gameScale;
	
	scale(gameScale);
	push();
	background(0);
	
	push();
	translate(-windowCamera.x + width / 2, -windowCamera.y + height / 2);
	stroke(255);
	strokeWeight(1 / gameScale);
	fill(0, 0);
	ellipse(0, 0, GAME_SIZE, GAME_SIZE); //The games border
	
	//Draw the players
	if (space) {
		players[myPlayer].shoot();
    }
	for (let i in allPlayers) {
		if (allPlayers[i].health > 0) {
			if (inWindow(allPlayers[i].pos, allPlayers[i].size)) {
				if (i == myPlayer) {
					allPlayers[i].show(true);
                } else {
					allPlayers[i].show();
				}
            }
			allPlayers[i].move();
		}
    }
	if (w) {
		players[myPlayer].accelerate(players[myPlayer].speed);
    }
	if (s) {
		players[myPlayer].accelerate(-players[myPlayer].speed);
    }
	if (a) {
		players[myPlayer].angle += -PLAYER_TURN_SPEED;
    }
	if (d) {
		players[myPlayer].angle += PLAYER_TURN_SPEED;
    }
	if (f) {
		players[myPlayer].vel.x = players[myPlayer].vel.x * PLAYER_BRAKE_STRENGTH;
		players[myPlayer].vel.y = players[myPlayer].vel.y * PLAYER_BRAKE_STRENGTH;
	}
	windowCamera = players[myPlayer].pos.copy();
	if (nameChoosen == false) {
		windowCamera.set(0, 0);
	}
	players[myPlayer].sendPos();
	
	//Player respawn
	if (respawnTimer > 0) {
		if (respawnTimer == 1) {
			players[myPlayer].respawn();
        }
		respawnTimer += -1;
    }
	
	//Drones
	if (gameHost == myPlayer) {
		for (let i = 0; i < drones.length; i++) {
			if (drones[i].health <= 0) {
				drones[i].respawn(1);
			}
			drones[i].shoot();
			drones[i].ai();
			drones[i].sendPos();
		}
	}
	
	//Bullets
	for (let i in bullets) {
		bullets[i].move();
		bullets[i].show();
		if (bullets[i].alive == false) {
			delete bullets[i];
        }
    }
	
	//Particles
	for (let i in particles) {
		particles[i].show();
		if (particles[i].duration <= 0) {
			delete particles[i];
        }
    }
	
	//Draw the stars
	if (nameChoosen) {
		stroke(255);
		strokeWeight(1 / gameScale);
		for (let i = 0; i < stars.length; i++) {
			if (inWindow(stars[i])) {
				point(stars[i].x, stars[i].y);
			}
	    }
	}
	pop();
	if (nameChoosen) {
		miniMap();
		scoreBoard();
	}
	pop();
	
	if (nameChoosen) {
		miniMapTimer += 1;
		if (miniMapTimer > MINI_MAP_TIMER) {
			miniMapTimer = 0;
	    }
		for (let i in allPlayers) {
			allPlayers[i].drawMiniMap();
	    }
	}
}

function inWindow(vec, size = 1) { //Returns true if a given point (vector) and size is in the window
	return ((vec.x + size > windowCamera.x - width / 2) && (vec.x - size < windowCamera.x + width / 2) && (vec.y + size > windowCamera.y - height / 2) && (vec.y - size < windowCamera.y + height / 2));
}

function generateRandomInt(num) {
	return Math.floor(Math.random() * num);
}

function keyPressed() {
	/** When a key is pressed
	*/
	//console.log(keyCode);
	if (keyCode == 87) { //W
		w = true;
	}
	if (keyCode == 83) { //S'
		s = true;
	}
	if (keyCode == 65) { //A
		a = true;
	}
	if (keyCode == 68) { //D
		d = true;
	}
	if (keyCode == 32) { //Space
		space = true;
	}
	if (keyCode == 70) { //F
		f = true;
	}
}

function keyReleased() {
	/** When a key is released
	*/
	if (keyCode == 87) { //W
		w = false;
	}
	if (keyCode == 83) { //S
		s = false;
	}
	if (keyCode == 65) { //A
		a = false;
	}
	if (keyCode == 68) { //D
		d = false;
	}
	if (keyCode == 32) { //Space
		space = false;
	}
	if (keyCode == 70) { //F
		f = false;
	}
}

function mouseWheel(event) {
	if (nameChoosen) {
		gameScale += -event.delta / 3000;
		if (gameScale > MAX_GAME_SCALE) {
			gameScale = MAX_GAME_SCALE;
	    } else if (gameScale < MIN_GAME_SCALE) {
			gameScale = MIN_GAME_SCALE;
	    }
	}
}

function nameImput() {
	players[myPlayer].name = this.value();
}

function chooseName() {
	removeElements();
	nameChoosen = true;
	players[myPlayer].respawn();
}
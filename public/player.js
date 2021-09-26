class Player {
    constructor(orig, id = "") {
        this.name = "";
        this.make(orig, id);
        allPlayers[id] = this;
    }
    
    make(orig, id) {
        this.type = "player";
        this.upgradeList = [];
        this.points = 0;
        this.allPoints = 0;
        this.level = 0;
        this.nextLevel = 1;
        this.id = id;
        this.orig = orig;
        let tempMag = GAME_SIZE * sqrt(random(0, 1)) / 2;
        let tempAng = random(0, TWO_PI);
        let tempX = tempMag * cos(tempAng);
        let tempY = tempMag * sin(tempAng);
        this.pos = createVector(tempX, tempY);
        tempX = random(-PLAYER_VEL, PLAYER_VEL);
        tempY = random(-PLAYER_VEL, PLAYER_VEL);
        this.vel = createVector(tempX, tempY);
		this.angle = random(0, TWO_PI);
        this.maxHealth = PLAYER_HEALTH;
        this.showHealthBar = false;
        if (this.id == myPlayer) {
            this.showHealthBar = true;
        }
		this.health = PLAYER_HEALTH;
		this.speed = PLAYER_SPEED;
		this.size = PLAYER_SIZE;
        this.shape = 0;
        this.drag = PLAYER_DRAG;
		this.bulletTimer = 0;
        this.bulletTimeout = PLAYER_BULLET_TIMEOUT;
        this.bulletSpeed = BULLET_SPEED;
        this.damage = 1;
        this.bulletCount = 1;
        this.spread = 0;
		tempX = random(0, 255);
		tempY = random(0, 255);
		let tempZ = random(0, 255);
        this.color = createVector(tempX, tempY, tempZ);
        tempX = 255 - tempX;
        tempY = 255 - tempY;
        tempZ = 255 - tempZ;
        this.shield = createVector(tempX, tempY, tempZ);
        this.extras = {};
		if (this.color.x > this.color.y) {
			if (this.color.x > this.color.z) {
				this.color.x = 255;
				this.shield.y = 255;
			} else {
				this.color.z = 255;
				this.shield.x = 255;
			}
		} else if (this.color.y > this.color.z) {
			this.color.y = 255;
			this.shield.z = 255;
		} else {
			this.color.z = 255;
			this.shield.x = 255;
		}
        tempX = map(this.pos.x, 0, GAME_SIZE, 0, GUI_SIZE);
        tempY = map(this.pos.y, 0, GAME_SIZE, 0, GUI_SIZE);
        this.mini = createVector(tempX, tempY);
        this.miniSize = 3;
    }
    
    show() {
        push();
        translate(this.pos.x, this.pos.y);
        if (this.showHealthBar) {
            this.drawHealthBar();
        }
        //Show name
        textSize(12);
        fill(this.color.x, this.color.y, this.color.z);
        stroke(0);
        textAlign(CENTER, TOP); //CENTER, CENTER is acytually broken. sorry
        text(this.name, -this.size / 2, -6, this.size, this.size / 2 + 6);
        
        rotate(this.angle);
        stroke(0, 0);
		fill(this.shield.x, this.shield.y, this.shield.z, 64);
        //fill(generateRandomInt(255), generateRandomInt(255), generateRandomInt(255));
		if (this.health <= 1) {
			fill(this.shield.x, this.shield.y, this.shield.z, generateRandomInt(64));
        }
        ellipse(0, 0, this.size, this.size);
		stroke(this.color.x, this.color.y, this.color.z);
		//stroke(generateRandomInt(255), generateRandomInt(255), generateRandomInt(255));
    	strokeWeight(1 / gameScale);
        this.drawShape(this.shape);
		pop();
			
		//On fire effect
		if ((this.health <= 1) && (this.health > 0)) {
			let tempMag = this.size * sqrt(random(0, 1)) / 2;
			let tempAngle = Math.random() * TWO_PI;
			let tempX = tempMag * sin(tempAngle) + this.pos.x;
			let tempY = tempMag * cos(tempAngle) + this.pos.y;
            particles[generateRandomInt(GAME_SIZE)] = new Particle(tempX, tempY, 0, 0, "fire", 40 + generateRandomInt(5));
        }
    }
    
    drawHealthBar() {
        //Health bar
        if (this.health > 0) {
    		fill(0, 0);
    		stroke(0, 255, 0, 128);
            strokeWeight(2 / gameScale);
            if (this.health == this.maxHealth) {
                ellipse(0, 0, this.size, this.size);
            } else {
        		arc(0, 0, this.size, this.size, map(this.health, 0, this.maxHealth, PI + HALF_PI, -HALF_PI), -HALF_PI);
            }
        }
    }
    
    drawMiniMap() {
        if (this.health > 0) {
            push();
            translate(width - GUI_SIZE / 2 / gameScale, height - GUI_SIZE / 2 / gameScale);
            scale(1 / gameScale);
            fill(0, 0);
            stroke(this.color.x, this.color.y, this.color.z);
            strokeWeight(this.miniSize);
            point(this.mini.x, this.mini.y);
            pop();
        }
        if (miniMapTimer == 0) {
            let tempX = map(this.pos.x, 0, GAME_SIZE, 0, GUI_SIZE);
            let tempY = map(this.pos.y, 0, GAME_SIZE, 0, GUI_SIZE);
            this.mini.set(tempX, tempY);
        }
    }
    
    drawShape(shape) {
        switch (shape) {
            case 0: //The arrow
    			let tempSize = this.size / 2;
    			line(tempSize, 0, -tempSize * sin(PI / 4), tempSize * cos(PI / 4));
    			line(tempSize, 0, -tempSize * sin(PI / 4), -tempSize * cos(PI / 4));
    			line(-tempSize * sin(PI / 4), tempSize * cos(PI / 4), -tempSize / 3, 0);
    			line(-tempSize * sin(PI / 4), -tempSize * cos(PI / 4), -tempSize / 3, 0);
                break;
            case 1: //A plus
                let tempSize1 = this.size / 4;
                line(-tempSize1, 0, tempSize1, 0);
                line(0, -tempSize1, 0, tempSize1);
                break;
            case 2: //the arrow and plus
                this.drawShape(0);
                this.drawShape(1);
                break;
        }
    }
    
    move() {
        this.pos = this.pos.add(this.vel); //Moving the player
        
        //The drag of the player
        let tempForce = this.vel.x * this.vel.x * this.drag;
		if (this.vel.x >= 0) {
            this.vel.x += -tempForce;
        } else {
			this.vel.x += tempForce;
		}
		tempForce = this.vel.y * this.vel.y * this.drag;
		if (this.vel.y >= 0) {
			this.vel.y += -tempForce;
        } else {
			this.vel.y += tempForce;
		}
        
        //Collision
		if (dist(0, 0, this.pos.x, this.pos.y) > GAME_SIZE / 2 - this.size / 2) {
			var tempAngle = atan2(this.pos.y, this.pos.x);
			this.pos.x = (GAME_SIZE / 2 - this.size / 2 - 1) * cos(tempAngle);
			this.pos.y = (GAME_SIZE / 2 - this.size / 2 - 1) * sin(tempAngle);
			tempAngle = tempAngle + PI;
			var tempRad = dist(0, 0, this.vel.x, this.vel.y) / 2;
			this.vel.x = tempRad * cos(tempAngle);
			this.vel.y = tempRad * sin(tempAngle);
		}
        
        //Bullet timer
        if (this.bulletTimer > 0) {
            this.bulletTimer += -1;
        }
    }
    
    ai() {
        if (this.health > 0) {
            let target = "";
            let distance = Infinity;
            for (let i in allPlayers) {
                if ((this.id != i) && (allPlayers[i].health > 0)) {
                    let tempDist = dist(this.pos.x, this.pos.y, allPlayers[i].pos.x, allPlayers[i].pos.y);
                    if (tempDist < distance) {
                        distance = tempDist;
                        target = i;
                    }
                }
            }
            if (this.type == "medic") {
                target = this.orig;
            }
            if (target != "") {
    			this.angle = atan2(this.pos.y - allPlayers[target].pos.y, this.pos.x - allPlayers[target].pos.x) + PI;
    			if ((this.health > 1) || (this.type != "drone")) {
    				this.accelerate(this.speed);
                } else {
    				this.accelerate(-this.speed);
    			}
            }
        }
    }
    
    isHit(pos) {
        //Returns true if a given vector is within the players hitbox
        let tempDist = dist(pos.x, pos.y, this.pos.x, this.pos.y);
        let tempSize = this.size / 2;
        if (tempDist <= tempSize) {
            return true;
        } else {
            return false;
        }
    }
    
    accelerate(speed) {
		let tempX = this.vel.x + cos(this.angle) * speed;
		let tempY = this.vel.y + sin(this.angle) * speed;
        this.vel.set(tempX, tempY);
	}
    
    shoot() {
        if (this.health > 0) {
            if (this.bulletTimer == 0) {
                this.shot(this.type);
                this.bulletTimer = this.bulletTimeout;
            }
        }
    }
    
    shot(type = "player") {
        switch (type) {
            case "player": //Standard bullet fire
            case "drone":
                for (let i = 0; i < this.bulletCount; i++) {
                    let tempX = this.pos.x + (cos(this.angle) * (this.size / 2));
                    let tempY = this.pos.y + (sin(this.angle) * (this.size / 2));
                    let tempVel = createVector(1, 1);
                    tempVel.setMag(this.bulletSpeed);
                    tempVel.setHeading(this.angle + random(-this.spread, this.spread));
                    tempVel = tempVel.add(this.vel);
                    let data = {
                        id: generateRandomInt(GAME_SIZE),
                        origId: this.id,
                        orig: this.orig,
                        x: tempX,
                        y: tempY,
                        vX: tempVel.x,
                        vY: tempVel.y,
                        explo: true,
                            damage: this.damage,
                        type: 0
                    };
                    socket.emit("bullet", data);
                    re_bullet(data);
                    if (this.damage > 1) {
                        this.accelerate(-this.damage / 2);
                    }
                }
                break;
            case "medic":
                let tempX = this.pos.x + (cos(this.angle) * (this.size / 2));
                let tempY = this.pos.y + (sin(this.angle) * (this.size / 2));
                let tempVel = createVector(1, 1);
                tempVel.setMag(this.bulletSpeed);
                tempVel.setHeading(this.angle + random(-this.spread, this.spread));
                tempVel = tempVel.add(allPlayers[this.orig].vel);
                let data = {
                    id: generateRandomInt(GAME_SIZE),
                    origId: this.id,
                    orig: this.orig,
                    x: tempX,
                    y: tempY,
                    vX: tempVel.x,
                    vY: tempVel.y,
                    red: 0,
                    gre: 255,
                    blu: 0,
                    particle: "green",
                    damage: -DEFULT_REGEN,
                    explo: false,
                    glimmer: true,
                    type: 0
                };
                socket.emit("bullet", data);
                re_bullet(data);
                break;
        }
    }
    
    respawn(type = 0) {
        switch (type) {
            case 0:
                this.make(this.orig, this.id);
                if (this.id == myPlayer) {
                    for (let i in extras) {
                        socket.emit("killExtra", i);
                        delete extras[i];
                        delete allPlayers[i];
                    }
                }
                break;
            case 1:
                this.make(this.orig, this.id);
                this.type = "drone";
                this.maxHealth = DRONE_HEALTH;
                this.health = DRONE_HEALTH;
                this.size = DRONE_SIZE;
                this.speed = DRONE_SPEED;
                this.drag = DRONE_DRAG;
                this.miniSize = 1;
                this.bulletTimer = generateRandomInt(DRONE_BULLET_TIMEOUT);
                this.bulletTimeout = DRONE_BULLET_TIMEOUT;
                this.level = 1;
                this.nextLevel = 1;
                this.upgrade();
                break;
            case "medic":
                this.make(this.orig, this.id);
                this.pos = allPlayers[this.orig].pos.copy();
                this.color = allPlayers[this.orig].color.copy();
                this.shield = allPlayers[this.orig].shield.copy();
                this.type = "medic";
                this.showHealthBar = true;
                this.shape = 2;
                this.maxHealth = DRONE_HEALTH * 4;
                this.health = DRONE_HEALTH * 4;
                this.size = DRONE_SIZE;
                this.speed = DRONE_SPEED;
                this.drag = DRONE_DRAG;
                this.miniSize = 0;
                this.bulletTimer = generateRandomInt(DRONE_BULLET_TIMEOUT);
                this.bulletTimeout = DRONE_BULLET_TIMEOUT;
                this.level = 0;
                this.nextLevel = 1;
                break;
        }
        
        let tempData = this.getData();
        tempData.req = "";
        socket.emit("player", tempData);
        if ((this.id == myPlayer) && nameChoosen) {
            gameScale = 1;
        }
    }
    
    upgrade(type = "") {
        var upgradeList = {
            0: "max health",
            1: "bullet damage",
            2: "shotgun",
            3: "fire rate",
            4: "bullet speed",
            5: "medic"
        };
        if (type == "") {
            type = upgradeList[generateRandomInt(6)];
        }
        let reroll = false;
        switch (type) {
            case "max health":
                this.maxHealth += 5;
                this.health += 5;
                break;
            case "bullet damage":
                if (this.type == "medic") {
                    reroll = true;
                } else {
                    this.damage += 1;
                }
                break;
            case "shotgun":
                if (this.type == "medic") {
                    reroll = true;
                }
                this.bulletCount += 1;
                if (this.spread == 0) {
                    this.spread += 0.2;
                } else {
                    this.spread += this.spread;
                }
                break;
            case "fire rate":
                if (this.bulletTimeout == 1) {
                    reroll = true;
                } else {
                    this.bulletTimeout += -3;
                    if (this.bulletTimeout < 1) {
                        this.bulletTimeout = 1;
                    }
                }
                break;
            case "bullet speed":
                this.bulletSpeed += 3;
                break;
            case "medic":
                if (this.type == "player") {
                    let tempId = "medic " + generateRandomInt(GAME_SIZE);
                    extras[tempId] = new Player(this.orig, tempId);
                    extras[tempId].health = 0;
                    extras[tempId].respawn("medic");
                } else {
                    reroll = true;
                }
                break;
        }
        if (reroll) {
            return this.upgrade();
        } else {
            this.upgradeList.push(type);
            return type;
        }
    }
    
    sendPos() {
        let data = {
    		posX: this.pos.x,
    		posY: this.pos.y,
        	velX: this.vel.x,
        	velY: this.vel.y,
    		health: this.health,
    		angle: this.angle,
        	orig: this.orig,
        	id: this.id,
            size: this.size,
            points:this.allPoints,
            type: 0
        };
        socket.emit("player", data);
    }
    
    getData() {
        let data = {
            red: this.color.x,
            gre: this.color.y,
            blu: this.color.z,
            sRed: this.shield.x,
            sGre: this.shield.y,
            sBlu: this.shield.z,
            mini: this.miniSize,
            name: this.name,
            shape: this.shape,
            id: this.id,
            orig: this.orig,
            type: 1,
            req: ""
        };
        return data;
    }
    
    unGetData(data) {
        this.name = data.name;
        this.shape = data.shape;
        this.color.set(data.red, data.gre, data.blu);
        this.shield.set(data.sRed, data.sGre, data.sBlu);
        this.miniSize = data.mini;
    }
}
class Bullet {
    constructor(data) {
        this.id = data.id; //The bullet id
        this.orig = data.orig; //The socket id of the bullet sender
        this.sent = data.origId; //The player id of the player or drone that sent it
        this.pos = createVector(data.x, data.y);
        this.vel = createVector(data.vX, data.vY);
        this.color = createVector(data.red, data.gre, data.blu);
        this.damage = data.damage;
        if (this.damage == 2) {
            data.particle = "fire";
        } else if (this.damage > 2) {
            data.particle = "red";
        }
        if (typeof data.damage === 'undefined') {
            this.damage = 0;
        }
        this.points = data.points;
        if (typeof data.points === 'undefined') {
            this.points = 0;
        }
        if (typeof data.glimmer === 'undefined') {
            this.glimmer = false;
        } else {
            this.glimmer = true;
        }
        this.explosion = data.explo;
        this.particle = data.particle;
        this.showParticle = true;
        if (this.color.equals(createVector(0, 0))) {
            if (typeof allPlayers[this.sent] === 'undefined') {
                this.color = createVector(255, 0, 0);
            } else {
                this.color = allPlayers[this.sent].color.copy();
            }
        }
        if (typeof data.particle === 'undefined') {
            this.showParticle = false;
        }
        this.alive = true;
    }
    
    move() {
        this.pos.x += this.vel.x * 30 / frameRate(); //Moving the bullet
        this.pos.y += this.vel.y * 30 / frameRate();
        
        if (dist(0, 0, this.pos.x, this.pos.y) >= GAME_SIZE / 2) {
            this.alive = false;
        }
        
        if (this.orig == myPlayer) {
            for (let i in allPlayers) {
                if ((this.sent != i) && (allPlayers[i].health > 0)){
                    if (allPlayers[i].isHit(this.pos)) {
                        if ((this.sent == myPlayer) && (allPlayers[i].type == "medic")) {
                            this.damage = 0;
                        }
                        if (this.explosion) {
                            createExplosion(this.pos.x, this.pos.y, allPlayers[i].vel.x, allPlayers[i].vel.y, 30);
                        }
                        this.kill();
                        let tempData = {
                            req: allPlayers[i].orig,
                            id: i,
                            damage: this.damage,
                            points: this.points,
                            type: 2
                        };
                        if (myPlayer == allPlayers[i].orig) {
                            re_player(tempData);
                        } else {
                            socket.emit("player", tempData);
                        }
                    }
                }
            }
        }
    }
    
    show() {
        if (inWindow(this.pos, 3)) {
            if (this.glimmer) {
                stroke(this.color.x, this.color.y, this.color.z, generateRandomInt(255));
            } else {
                stroke(this.color.x, this.color.y, this.color.z);
            }
            strokeWeight(3 / gameScale);
            point(this.pos.x, this.pos.y);
            
            if (this.showParticle) {
                let tempMag = 7 * sqrt(random(0, 1)) / 2;
                let tempAngle = Math.random() * TWO_PI;
                let tempX = tempMag * sin(tempAngle) + this.pos.x;
                let tempY = tempMag * cos(tempAngle) + this.pos.y;
                if (inWindow(createVector(tempX, tempY))) {
                    particles[generateRandomInt(GAME_SIZE)] = new Particle(tempX, tempY, 0, 0, this.particle, 10 + generateRandomInt(5));
                }
            }
        }
    }
    
    kill() {
        let tempData = {
            id: this.id,
            type: 1,
        };
        socket.emit("bullet", tempData);
        re_bullet(tempData);
    }
}
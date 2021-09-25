class Particle {
    constructor(x, y, vX, vY, color, duration) {
        this.pos = createVector(x, y);
        this.vel = createVector(vX, vY);
        switch (color) {
            case "fire":
                this.color = createVector(255, generateRandomInt(255), generateRandomInt(64));
                break;
            case "green":
                let tempNum = generateRandomInt(130);
                this.color = createVector(tempNum, 255, tempNum);
                if (tempNum > 128) {
                    this.color.set(255, 255, 255);
                }
                break;
            case "purple":
                let tempNum2 = generateRandomInt(96);
                this.color = createVector(128 + tempNum2, 0, 128 + tempNum2);
                if (tempNum2 > 64) {
                    this.color.set(255, 255, 255);
                }
                break;
            case "red":
                let tempNum3 = generateRandomInt(130);
                this.color = createVector(generateRandomInt(128) + 128, 0, 0);
                if (tempNum3 > 128) {
                    this.color.set(255, 255, 255);
                }
                break;
        }
        this.duration = duration;
    }
    
    show() {
        if (inWindow(this.pos)) {
            stroke(this.color.x, this.color.y, this.color.z, generateRandomInt(255));
            strokeWeight(2 / gameScale);
            point(this.pos.x, this.pos.y);
        }
        this.pos = this.pos.add(this.vel);
        if (this.duration > 0) {
            this.duration += -1;
        }
    }
}

function createExplosion(x, y, vX, vY, size) {
    let data = {
        x: x,
        y: y,
        vX: vX,
        vY: vY,
        size: size,
        type: 0
    };
    socket.emit("effect", data);
    re_effect(data);
}

function re_effect(data) {
    switch (data.type) {
        case 0:
            if (inWindow(createVector(data.x, data.y))) {
                for (let i = 0; i < data.size; i++) {
                    let tempVel = p5.Vector.random2D();
                    tempVel.setMag(random(0, 1));
                    tempVel = tempVel.add(createVector(data.vX, data.vY));
                    particles[generateRandomInt(GAME_SIZE)] = new Particle(data.x, data.y, tempVel.x, tempVel.y, "fire", data.size + generateRandomInt(5));
                }
            }
            break;
    }
}

function deathBullets(player) {
    for (let i = 0; i < player.maxHealth; i++) {
        let tempVel = p5.Vector.random2D();
        tempVel.setMag(random(BULLET_SPEED / 2));
        tempVel = tempVel.add(player.vel);
        let tempData = {
            id: generateRandomInt(GAME_SIZE),
            origId: player.id,
            orig: player.orig,
            x: player.pos.x,
            y: player.pos.y,
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
        socket.emit("bullet", tempData);
        re_bullet(tempData);
    }
    for (let i = 0; i < player.level; i++) {
        let tempVel = p5.Vector.random2D();
        tempVel.setMag(random(BULLET_SPEED / 2));
        tempVel = tempVel.add(player.vel);
        let tempData = {
            id: generateRandomInt(GAME_SIZE),
            origId: player.id,
            orig: player.orig,
            x: player.pos.x,
            y: player.pos.y,
            vX: tempVel.x,
            vY: tempVel.y,
            red: 255,
            gre: 0,
            blu: 255,
            particle: "purple",
            points: i + 1,
            explo: false,
            glimmer: true,
            type: 0
        };
        socket.emit("bullet", tempData);
        re_bullet(tempData);
    }
}
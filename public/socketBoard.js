function re_player(data) {
    if (data.type != 2) { //New player (or drone) connects
        if (typeof allPlayers[data.id] === 'undefined') {
            let tempContin = true;
            if (data.id == data.orig) {
                players[data.id] = new Player(data.orig, data.id);
                updatePlayerList();
            } else {
                if (typeof players[data.orig] === 'undefined') {
                    tempContin = false;
                    data.type = -1;
                } else {
                    players[data.orig].extras[data.id] = new Player(data.orig, data.id);
                }
            }
            if (tempContin) {
                let tempData = {
                    orig: myPlayer,
                    req: data.orig,
                    reqId: data.id
                };
                socket.emit("reqPlayer", tempData);
                //console.log("requested");
            }
        }
    }
    switch (data.type) {
        case 0:
            allPlayers[data.id].pos.set(data.posX, data.posY);
            allPlayers[data.id].vel.set(data.velX, data.velY);
            allPlayers[data.id].health = data.health;
            allPlayers[data.id].angle = data.angle;
            allPlayers[data.id].size = data.size;
            allPlayers[data.id].allPoints = data.points;
            break;
        case 1:
            allPlayers[data.id].unGetData(data);
            break;
        case 2: //Taking damage and recieving points and getting knockback
            let tempPlayer = allPlayers[data.id];
            tempPlayer.health += -data.damage;
            if (tempPlayer.health <= 0) {
                if (tempPlayer.health + data.damage > 1) {
                    tempPlayer.health = 1;
                } else {
                    createExplosion(tempPlayer.pos.x, tempPlayer.pos.y, tempPlayer.vel.x, tempPlayer.vel.y, tempPlayer.size / 2);
                    deathBullets(tempPlayer);
                    tempPlayer.health = 0;
                    if (data.id == myPlayer) {
                        respawnTimer = 50;
                    }
                }
            } else if (tempPlayer.health > tempPlayer.maxHealth) {
                tempPlayer.health = tempPlayer.maxHealth;
            }
            
            //knockback
            tempPlayer.vel.x += data.knockbackX;
            tempPlayer.vel.y += data.knockbackY;
            
            //Points
            tempPlayer.points += data.points;
            tempPlayer.allPoints += data.points;
            tempPlayer.size += data.points * 3;
            if (tempPlayer.points >= tempPlayer.nextLevel) {
                tempPlayer.level += 1;
                tempPlayer.nextLevel += tempPlayer.level;
                tempPlayer.points = 0;
                tempPlayer.upgrade();
            }
            break;
    }
}

function re_reqPlayer(data) {
    let tempData = allPlayers[data.reqId].getData();
    tempData.req = data.orig;
    socket.emit("player", tempData);
}

function disconnect(id) {
    for (let i in players[id].extras) {
        delete allPlayers[i];
    }
    delete players[id];
    delete allPlayers[id];
    updatePlayerList();
}

function recGameHost(host) {
    gameHost = host;
    if (gameHost == myPlayer) {
        for (let i = 0; i < DRONES; i++) {
            drones[i] = new Player(myPlayer, "drone:" + i);
            drones[i].health = 0;
        }
    }
}

function re_bullet(data) {
    switch (data.type) {
        case 0:
            bullets[data.id] = new Bullet(data);
            break;
        case 1:
            if ((typeof bullets[data.id] === 'undefined') == false) {
                bullets[data.id].alive = false;
            }
            break;
    }
}

function kill_extra(data) {
    delete allPlayers[data];
}
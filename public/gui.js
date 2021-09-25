function miniMap() {
    fill(0, 0);
    stroke(255);
    strokeWeight(1 / gameScale);
    ellipse(width - GUI_SIZE / 2 / gameScale, height - GUI_SIZE / 2 / gameScale, GUI_SIZE / gameScale, GUI_SIZE / gameScale);
}

function updatePlayerList() {
    playerList = Object.entries(players);
}

function scoreBoard() {
    playerList.sort((a, b) => (a[1].allPoints < b[1].allPoints) ? 1 : -1);
    fill(128, 32);
    stroke(128, 64);
    let guiSize = GUI_SIZE / gameScale;
    rect(width - guiSize, 0, guiSize, guiSize);
    
    let iter;
    if (playerList.length >= 10) {
        iter = 10;
    } else {
        iter = playerList.length;
    }
    stroke(0);
    textSize(guiSize / 11 - 5);
    textAlign(LEFT, TOP);
    for (let i = 0; i < iter; i++) {
        fill(playerList[i][1].color.x, playerList[i][1].color.y, playerList[i][1].color.z);
        let striiing =  (i + 1) + " : " + playerList[i][1].name + " : score " + playerList[i][1].allPoints;
        text(striiing, width - guiSize, i * guiSize / 11);
    }
}
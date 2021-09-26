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
        let striiing =  (i + 1) + " : " + truncateString(playerList[i][1].name, 10) + " : score " + playerList[i][1].allPoints;
        text(striiing, width - guiSize, i * guiSize / 11);
    }
}

function upgradeBoard() {
    fill(128, 32);
    stroke(128, 64);
    let guiSize = GUI_SIZE / gameScale;
    let listLength = players[myPlayer].upgradeList.length;
    rect(0, 0, guiSize, listLength * (14 / gameScale));
    stroke(0);
    fill(players[myPlayer].color.x, players[myPlayer].color.y, players[myPlayer].color.z);
    textSize(guiSize / 11 - 5);
    textAlign(CENTER, TOP);
    for (let i = 0; i < listLength; i++) {
        text(players[myPlayer].upgradeList[i], guiSize / 2, i * 14 / gameScale);
    }
}

function truncateString(str, num) { //Not my function
    // If the length of str is less than or equal to num
    // just return str--don't truncate it.
    if (str.length <= num) {
        return str
    }
    // Return str truncated with '...' concatenated to the end of str.
    return str.slice(0, num) + '...'
}
var express = require("express");

var gameHost = 0;

var app = express();
var server = app.listen(3000);

app.use(express.static("public"));

console.log("running");

var socket = require("socket.io");

var io = socket(server);
io.sockets.on("connection", newConnection);

function newConnection(socket) {
	console.log("new connection :" + socket.id);
	socket.on("disconnecting", discon);
	if (gameHost == 0) {
		gameHost = socket.id;
    }
	socket.emit("gameHost", gameHost);
	function discon() { //When the player disconnects
		console.log("disconnecting :" + socket.id);
		socket.broadcast.emit("discon", socket.id);
		if (socket.id == gameHost) {
			//!!! try find another game host, else do below
			gameHost = 0;
        }
	}
	
	socket.on("player", player);
	socket.on("reqPlayer", reqPlayer);
	function player(data) {
		switch (data.type) {
            case 0:
				if ((data.orig != "") && (data.id != "")) {
					if (rollDice(20)) {
						socket.broadcast.emit("re_player", data);
                    } else {
						socket.broadcast.volatile.emit("re_player", data);
					}
                }
				break;
			case 1:
				let tempRoom = data.req;
				if (tempRoom == "") {
					socket.broadcast.emit("re_player", data);
                } else {
					socket.to(tempRoom).emit("re_player", data);
				}
				break;
			case 2:
				if (data.req != "") {
					socket.to(data.req).emit("re_player", data);
                }
        }
    }
	function reqPlayer(data) {
		let tempRoom = data.req;
		socket.to(tempRoom).emit("re_reqPlayer", data);
    }
	socket.on("killExtra", killExtra);
	function killExtra(data) {
		socket.broadcast.emit("kill_extra", data);
    }
	
	socket.on("bullet", bullet);
	function bullet(data) {
		switch (data.type) {
			case 0:
			case 1:
				socket.broadcast.emit("re_bullet", data);
				break;
        }
    }
	
	socket.on("effect", effect);
	function effect(data) {
		socket.broadcast.emit("re_effect", data);
    }
}

function rollDice(num) {
    if (Math.random() * num < 1) {
		return true;
    } else {
		return false;
	}
}
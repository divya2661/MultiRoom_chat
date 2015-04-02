
var express = require('express');
var app = express();
var port = 9000;
var io = require('socket.io').listen(app.listen(port));

// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

 var usernames = {};
// var people = {};
//var socketlist = [];
var rooms = ['room1','room2','room3'];

io.sockets.on('connection', function (socket) {

	//socketlist.push(socket);
	
	socket.on('adduser', function(username){

		socket.username = username;
		socket.room = 'room1';
		usernames[username] = username;
		socket.join('room1');
		socket.emit('updatechat', 'SERVER', 'you have connected to room1');
		socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room');
		io.sockets.emit('updateusers',usernames);
		socket.emit('updaterooms', rooms, 'room1');
	});

	
	socket.on('sendchat', function (data) {
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});



	socket.on('switchRoom', function(newroom){
		socket.leave(socket.room);
		socket.join(newroom);
		socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
		socket.emit('updaterooms', rooms, newroom);
	});

	// socket.on('create',function(room,runame){
	// 	console.log("yes it is coming heree.");
	// 	rooms.push(room);
	// 	socket.emit('updaterooms',room,socket.room);
		
	// 	socket.leave(socket.room);
	// 	socket.join(room);



	// });

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});


});
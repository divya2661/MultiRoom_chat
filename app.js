
	var express = require('express');
	var Room = require('./room.js')
	var app = express();
	var port = 9000;
	var io = require('socket.io').listen(app.listen(port));

	// routing
	app.get('/', function (req, res) {
	  res.sendfile(__dirname + '/index.html');
	});

	var usernames = {};
	//var people = {};
	//var socketlist = [];
	var rooms = ['room1'];

	var crt_rooms = {};



io.sockets.on('connection', function (socket) {

		//socketlist.push(socket);
	//------------------------------ADDING USER------------------	
		socket.on('adduser', function(username){

		//	people[socket.id] = {name: username};
			socket.username = username;
			socket.room = username;
			rooms.push(username);
			usernames[username] = username;
			socket.join(username);
			socket.emit('updatechat', 'SERVER', 'you are connected to room  ' + username);
			socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room');
			io.sockets.emit('updateusers',usernames);
			//socket.emit('updaterooms', rooms, username);
		
		});

	
	//--------------------------ROOM CHATS-----------------------

		socket.on('sendchat', function (data) {
			io.sockets.in(socket.room).emit('updatechat', socket.username, data);
		});


	//----------------------------PRIVATE CHAT---------------------
	
		socket.on('send_pri_msg',function(receiverName,msg){

			console.log("its coming here. " + receiverName + ' ' + msg);


			io.sockets.in(receiverName).emit('new_msg',socket.username,msg,socket.username);
			io.sockets.in(socket.username).emit('new_msg',receiverName,msg,socket.username);
			
			//io.sockets.in(socket.username).emit('updatechat', socket.username, msg);
		})

	//------------------------SWITCHING ROOMS--------------------------
		socket.on('switchRoom', function(newroom){

			console.log('switiching room.');
			//socket.emit('updateNotification',socket.username,newroom);
			
			if(socket.room !== socket.username){
				socket.leave(socket.room);
			}
			
			socket.join(newroom);
			socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
			socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
			socket.room = newroom;
			socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
			//socket.emit('updaterooms', rooms, newroom);
		});

	//------------------------CRATING ROOM-----------------------

		socket.on('createRoom',function(roomName){

			console.log('its also working..');
			console.log('username: ' +  socket.username);
			console.log('roomName: ' +  roomName);
			
			if(roomName === socket.username)
			{
				console.log('going oto if..');
				socket.emit('updatechat', 'SERVER', 'Please put a different room name from your username');
			
			}
			else
			{
				socket.room = roomName;
				crt_rooms[roomName] = roomName;
				socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has created the room ' + roomName);
				socket.emit('update_crtrooms',crt_rooms);
				socket.broadcast.emit('update_crtrooms',crt_rooms);
				var room = roomName
				if(socket.room !== socket.username){
					socket.leave(socket.room);
				}
				socket.join(roomName);

			 }
			
			

		 });

	//--------------------------_DISCONNECT---------------------------
		// when the user disconnects.. perform this
		socket.on('disconnect', function(){

			//delete people[socket.id];
			delete usernames[socket.username];
			io.sockets.emit('updateusers', usernames);
			//socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
			socket.leave(socket.room);
		});


});
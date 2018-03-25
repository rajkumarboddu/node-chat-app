const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const path = require('path');

const port = process.env.PORT || 3000;
const {Users} = require('./user');
const {generateNewMessage, generateNewLocationShareMessage, isValidString} = require('./utils');

let app = express();
console.log(path.join(__dirname, '../public'));
app.use(express.static(path.join(__dirname, '../public')));

let server = http.createServer(app);
let io = socketIO(server);
const users = new Users();

io.on('connect', (socket) => {
	console.log('A new user connected...');
	io.emit('roomNames', users.getRoomNames());

	socket.on('join', (data, callback) => {
		const user_name = data.name;
		const room_name = data.roomName;

		if(!(isValidString(user_name) && isValidString(room_name))) {
			return callback('Name and Room Name are required.');
		}

		if(users.isUsernameExists(user_name)) {
			return callback('User with the same name has already joined!');
		}

		socket.join(room_name);
		users.addUser(socket.id, user_name, room_name);
		io.to(room_name).emit('usersUpdated', users.getUserNames(room_name));
		socket.emit('newMessage', generateNewMessage('Admin', 'Welcome to the chat app!', new Date()));
		socket.broadcast.to(room_name).emit('newMessage', generateNewMessage('Admin', `${user_name} has joined!`, new Date()));
		callback();
	});

	socket.on('newMessage', (message, callback) => {
		const user = users.getUser(socket.id);
		if(user) {
			io.to(user.room_name).emit('newMessage', generateNewMessage(user.name, message.message, message.created_at));
			return callback();
		}
		callback('You are no longer connected to send message');
	});

	socket.on('newLocationShareMessage', (message, callback) => {
		const user = users.getUser(socket.id);
		if(user) {
			io.to(user.room_name).emit('newLocationShareMessage', generateNewLocationShareMessage(user.name, message.lat, message.lng, message.created_at));
			return callback();
		}
		callback('You are no longer connected to send message');
	});

	socket.on('disconnect', () => {
		const removed_user = users.removeUser(socket.id);
		if(removed_user) {
			io.to(removed_user.room_name).emit('usersUpdated', users.getUserNames(removed_user.room_name));
			socket.broadcast.to(removed_user.room_name).emit('newMessage', generateNewMessage('Admin', `${removed_user.name} has left!`, new Date()));
		}
	});
});

server.listen(port, () => {
	console.log(`Server started on port ${port}`);
});
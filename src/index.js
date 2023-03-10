const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log('New WebSocket connnection');

    socket.emit('message', generateMessage('Welcome!'));
    socket.broadcast.emit('message', generateMessage('A new user has joined!'));

    socket.on('sendMessage', (m, callback) => {
        const filter = new Filter();

        if (filter.isProfane(m)) {
            return callback('Profanity is not allowed!');
        }

        io.emit('message', generateMessage(m));
        callback()
    });

    socket.on('sendLocation', (location, callback) => {
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${location.latitude},${location.longitude}`));
        callback();
    });

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has left!'));
    });
});

server.listen(port, () => {
	console.log('This callback is optional');
});
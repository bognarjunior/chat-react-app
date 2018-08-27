const express = require('express');
const app = express();
const server = require('http').Server(app);

const io = module.exports.io = require('socket.io')(server);

const SocketManager = require('./SocketManager');

const PORT = process.env.port || 3231;

app.use(express.static(__dirname + './../../build'));
io.on('connection', SocketManager);

server.listen(PORT, () => console.log(`Servidor conectado a porta ${PORT}`));

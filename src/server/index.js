const app = require('http').createServer();
const io = Module.exports.io = require('socket.io')(app);

const SocketManager = require('./SocketManager');

const PORT = process.env.port || 3231;

io.connection('connection', SocketManager);

app.listen(PORT, () => console.log(`Servidor conectado a porta ${PORT}`));

import http from 'http';
import socketio from 'socket.io';
import ioClient from 'socket.io-client';

const setup = () => {
    const server = http.createServer();
    const io = socketio(server);
    server.listen(5000);
    const gamensp = io.of('/games/12345');
    gamensp.on('connection', (socket) => {
        console.log('got conection:', socket.handshake.query.username);
    })
}

const tryConnection = () => {
    const mockClient = ioClient('http://localhost:5000/games/12345', {
        query: { username: 'ikey' },
    });
    mockClient.on('connect', () => {
        console.log('we connected!', mockClient.id);
    });
}

setup();
tryConnection();
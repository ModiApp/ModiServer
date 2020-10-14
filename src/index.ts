import express from 'express';
import socketio from 'socket.io';

const app = express();
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log('running'));
const io = socketio(server);


const authorizedAccessTokens = ['1', '2', '3', '4'];
const connections: { [username: string]: boolean } = {};



io.of('/games/1234').on('connect', (socket) => {
  const { accessToken, username } = socket.handshake.query;
  if (!authorizedAccessTokens.includes(accessToken)) {
    return socket.disconnect();
  }
  connections[username] = true;
  socket.on('disconnect', () => {
    connections[username] = false;
  });

  socket.on('get connections', () => {
    socket.emit('connections', connections);
  })

  socket.on('get live updates', (fromVersion?: number) => {
    socket.emit('state change', '', fromVersion || 0);
  });
});

export default app;

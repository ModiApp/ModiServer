import http from 'http';
import startServer from '../src/GameRoomServer';

http
  .get('http://localhost:5000', (res) => {
    console.log(res.statusCode);
  })
  .on('error', () => startServer());

import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export const startServer = () => {
  socket.emit('start');
};

export const stopServer = () => {
  socket.emit('stop');
};

export default socket;

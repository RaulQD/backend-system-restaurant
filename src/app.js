
import { UserModel } from './models/user.js';
import { server } from './server.js';
import { Server as WebSocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { setUpWebSockets } from './config/socket.js';

const PORT = process.env.PORT
const io = new WebSocketServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // frontend url
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  }
})

setUpWebSockets(io)

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})

export { io }
import { Server as WebSocketServer } from 'socket.io';
import { UserModel } from '../models/user.js';

export const setUpWebSockets = (server) => {
  const io = new WebSocketServer(server, {
    cors: {
      origin: 'http://localhost:5173', // frontend url
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  })

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Token no proporcionado o formato incorrecto'));
      const decoded = jwt.verify(token, process.env.SECRET_KEY)
      if (!decoded.id) throw new Error('Token inválido');
      const user = await UserModel.findByUserId(decoded.id)
      if (!user) return next(new Error('Usuario no autorizado o no encontrado'));
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Autenticación fallida: ' + error.message));
    }
  })

  io.on('connection', (socket) => {
    console.log(`usuario connectado: ${socket.user.username} ${socket.user.role_name}`);
    if (socket.user.role_name === 'mesero') {
      socket.join(`mesero_${socket.user.id}`);
      console.log(`Mesero ${socket.user.id} joined room mesero_${socket.user.id}`);
    } else if (socket.user.role_name === 'cocinero') {
      socket.join("cocina");
      console.log(`📌 Cocinero ${socket.user.id} unido a sala: cocina`);
    }
    socket.on('disconnect', () => {
      console.log(`usuario desconectado`)
    })
  })

  return io;
}
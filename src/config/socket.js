import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.js';
export const setUpWebSockets = (io) => {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Token no proporcionado o formato incorrecto'));
    }
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      if (!decoded) {
        return next(new Error('Token no válido'));
      }
      const user = await UserModel.findByUserId(decoded.id);
      if (!user) {
        return next(new Error('Usuario no autorizado o no encontrado'));
      }
      socket.user = user;
      next();
    } catch (error) {
      console.log('❌ Token inválido o expirado:', error.message);
      return next(new Error('Token inválido o expirado'));
    }

  })
  //used to store the socket id of the user
  io.on('connection', (socket) => {
    const { user } = socket;
    console.log('Nuevo usuario conectado:', { id: user.id, role_name: user.role_name });
    //UNIVER A SALAS 
    if (user.role_name === 'administrador') socket.join('administrador');
    if (user.role_name === 'cocinero') socket.join('cocina');
    if (user.role_name === 'mesero') socket.join(`mesero_${user.id}`);

    //EVENTOS 
    socket.on('join-orders-ready', () => socket.join('orders-ready'));
    socket.on('leave-orders-ready', () => socket.leave('orders-ready'));
    socket.on('send-order-to-kitchen', (orderData) => {
      io.to('cocina').emit('new-order-to-send-kitchen', orderData);
    })
    socket.on('update-order-item-status', (orderItemData) => {
      io.to(`mesero_${orderItemData.waiter_id}`).emit('update-order-item-status', orderItemData);
      io.to('cocina').emit('update-list-kitchen', orderItemData)
    });

    socket.on('disconnect', () => {
      console.log(`❌ Usuario desconectado (Socket ID: ${user.id})`);
    })

  })
}
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

    //UNIR AL USUARIO A UN SALA SEGÚN SU ROL
    if (user.role_name === 'cocinero') {
      console.log(`👨‍🍳 Usuario ${user.id} agregado a la cocina`);
      socket.join('cocina');
    }
    if (user.role_name === 'mesero') {
      console.log(`👨‍🍳 Usuario mesero_${user.id} agregado a la sala`);
      socket.join(`mesero_${user.id}`);
    }
    socket.on('join-orders-ready', () => {
      console.log(`👨‍🍳 Usuario mesero_${user.id} agregado a la sala de ordenes listas`);
      socket.join('orders-ready')
    })
    socket.on('leave-orders-ready', () => {
      console.log(`👨‍🍳 Usuario mesero_${user.id} eliminado de la sala de ordenes listas`);
      socket.leave('orders-ready')
    })

    //EMITIR LA ORDEN AL MESERO
    socket.on('send-order-to-kitchen', (orderData) => {
      console.log('🍽️ Nueva orden:', orderData);
      //EMITIR LA ORDEN A LA COCINA
      io.to('cocina').emit('new-order-to-send-kitchen', orderData);
    })
    //EVENTO PARA ACTUALIZAR EL ESTADO DE LA ORDEN
    socket.on('update-order-item-status', (orderItemData) => {
      console.log('🍽️ Actualizar estado del platillo:', orderItemData);
      // Emitir evento al mesero que creó la orden
      io.to(`mesero_${orderItemData.waiter_id}`).emit('update-order-item-status', orderItemData);
      io.to('cocina').emit('update-list-kitchen', orderItemData)
    });

    socket.on('disconnect', () => {
      console.log(`❌ Usuario desconectado (Socket ID: ${user.id})`);
    })

  })
}
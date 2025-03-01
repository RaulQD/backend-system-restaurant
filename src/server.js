import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import { corsConfig } from './config/cors.js';
import { connectMysql } from './config/mysql.js';

import rolRoutes from './routes/rol.routes.js';
import authRoutes from './routes/auth.routes.js';
import dishesRoutes from './routes/dishes.routes.js';
import categoryRoutes from './routes/category.routes.js';
import roomsRoutes from './routes/rooms.routes.js';
import tablesRoutes from './routes/tables.routes.js';
import employeesRoutes from './routes/employee.routes.js';
import ordersRoutes from './routes/order.routes.js';

dotenv.config();
connectMysql();
const server = express()

server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(morgan('dev'))
server.use(cors(corsConfig))

server.use('/api/v1/auth', authRoutes);
server.use('/api/v1/rol', rolRoutes)
server.use('/api/v1/dishes', dishesRoutes);
server.use('/api/v1/category', categoryRoutes);
server.use('/api/v1/rooms', roomsRoutes);
server.use('/api/v1/tables', tablesRoutes);
server.use('/api/v1/employees', employeesRoutes);
server.use('/api/v1/orders', ordersRoutes);


export default server;
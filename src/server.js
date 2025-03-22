import express from 'express';
import { createServer } from 'node:http';
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
const app = express()
const server = createServer(app)


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use(cors(corsConfig))

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/rol', rolRoutes)
app.use('/api/v1/dishes', dishesRoutes);
app.use('/api/v1/category', categoryRoutes);
app.use('/api/v1/rooms', roomsRoutes);
app.use('/api/v1/tables', tablesRoutes);
app.use('/api/v1/employees', employeesRoutes);
app.use('/api/v1/orders', ordersRoutes);

export { server, app }

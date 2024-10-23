import Router from 'express';
import { OrderModel } from '../models/orders.js';

const routes = Router();


routes.post('/', OrderModel.createOrder)


export default routes;
import Router from 'express';
import { OrderController } from '../controllers/OrderController.js';

const routes = Router();


routes.post('/', OrderController.createOrder)
routes.get('/', OrderController.getOrders)
routes.get('/:orderId', OrderController.getOrderById)
routes.patch('/:orderId/cancel/:tableId', OrderController.cancelOrder)


export default routes;
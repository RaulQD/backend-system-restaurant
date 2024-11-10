import Router from 'express';
import { OrderController } from '../controllers/OrderController.js';

const routes = Router();


routes.post('/', OrderController.createOrder)
routes.post('/add-item', OrderController.addItemToOrder)
routes.get('/', OrderController.getOrders)
routes.get('/:orderId', OrderController.getOrderById)
routes.get('/:orderId/items', OrderController.getOrderItems)
routes.patch('/:orderId/status', OrderController.updateOrderStatus)
routes.patch('/:orderId/cancel/:tableId', OrderController.cancelOrder)


export default routes;
import Router from 'express';
import { OrderController } from '../controllers/OrderController.js';

const routes = Router();


routes.post('/', OrderController.createOrder)
routes.post('/add-item', OrderController.addItemToOrder)
routes.get('/', OrderController.getOrdersForKitchen)
routes.get('/:orderId', OrderController.getOrderById)
routes.get('/tables/:tableId/order', OrderController.getOrdersByTableId)
// routes.get('/:orderId/items', OrderController.getOrderItemsByOrderId)
routes.patch('/:orderId/status', OrderController.updateOrderStatus)
routes.patch('/:orderId/item/:itemId/status', OrderController.updateOrderItemStatus)
routes.patch('/:orderId/cancel/:tableId', OrderController.cancelOrder)


export default routes;
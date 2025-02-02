import Router from 'express';
import { OrderController } from '../controllers/OrderController.js';

const routes = Router();


routes.post('/', OrderController.createOrder)
routes.patch('/:orderId/add-item', OrderController.addItemToOrder);
routes.patch('/:orderId/remove-item', OrderController.removeItemFromOrder);
routes.patch('/:orderId/decrease-quantity', OrderController.decreaseItemQuantity)
routes.get('/', OrderController.getOrders)
routes.get('/kitchen', OrderController.getOrdersForKitchen)
routes.get('/active/:tableId', OrderController.getOrdersByTableId)
routes.get('/:orderId/items', OrderController.getOrderItems)
routes.get('/:orderId', OrderController.getOrderById)
routes.patch('/:orderId/status', OrderController.updateOrderStatus)
routes.patch('/:orderId/item/:itemId/status', OrderController.updateOrderItemStatus)
routes.patch('/:orderId/cancel', OrderController.cancelOrder)
routes.patch('/:orderId/send-kitchen', OrderController.sendOrderToKitchen)

export default routes;
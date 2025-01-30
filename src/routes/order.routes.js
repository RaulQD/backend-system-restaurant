import Router from 'express';
import { OrderController } from '../controllers/OrderController.js';

const routes = Router();


routes.post('/', OrderController.createOrder)
routes.patch('/:orderId/add-item', OrderController.addItemToOrder);
routes.patch('/:orderId/remove-item', OrderController.removeItemFromOrder);
routes.patch('/:orderId/descreaseItem', OrderController.decreaseItemQuantity)
routes.get('/', OrderController.getOrders)
routes.get('/kitchen', OrderController.getOrdersForKitchen)
routes.get('/:orderId', OrderController.getOrderById)
routes.get('/active/:tableId', OrderController.getOrdersByTableId)
routes.get('/:orderId/items', OrderController.getOrderItems)
routes.patch('/:orderId/status', OrderController.updateOrderStatus)
routes.patch('/:orderId/item/:itemId/status', OrderController.updateOrderItemStatus)
routes.patch('/:orderId/cancel/:tableId', OrderController.cancelOrder)

export default routes;
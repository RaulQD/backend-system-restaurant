import Router from 'express';
import { OrderController } from '../controllers/OrderController.js';
import { authorizeRole, validateToken } from '../middlewares/auth.js';
import { handleInputErrors } from '../middlewares/validation.js';
import { param } from 'express-validator';
import { orderValidation, validateOrderActiveForTable, validateOrderExist, validateOrderPayment, validateUpdateOrderItemsStatus } from '../middlewares/order.js';

const routes = Router();


routes.post('/',
  validateToken,
  handleInputErrors,
  authorizeRole(['administrador', 'mesero']),
  OrderController.createOrder)
routes.patch('/:orderId/add-item',
  param('orderId').isInt().withMessage('El id de la orden no es valido.'),
  validateOrderExist,
  orderValidation,
  validateToken,
  handleInputErrors,
  authorizeRole(['administrador', 'mesero']),
  OrderController.addItemToOrder);
routes.patch('/:orderId/remove-item',
  param('orderId').isInt().withMessage('El id de la orden no es valido.'),
  validateToken,
  authorizeRole(['administrador', 'mesero']),
  validateOrderExist,
  handleInputErrors,
  OrderController.removeItemFromOrder);
routes.patch('/:orderId/decrease-quantity',
  param('orderId').isInt().withMessage('El id de la orden no es valido.'),
  validateOrderExist,
  validateToken,
  authorizeRole(['administrador', 'mesero']),
  handleInputErrors,
  OrderController.decreaseItemQuantity)
routes.get('/',validateToken,authorizeRole(['administrador']), OrderController.getOrders)
routes.get('/kitchen',
  validateToken,
  authorizeRole(['administrador', 'cocinero']),
  OrderController.getOrdersForKitchen)
routes.get('/ready-for-serving',
  validateToken,
  authorizeRole(['administrador', 'mesero']),
  OrderController.getOrdersReady
)
routes.get('/active/:tableId',
  param('tableId').isInt().withMessage('El id de la mesa no es valido.'),
  validateOrderActiveForTable,
  validateToken,
  authorizeRole(['administrador', 'mesero']),
  handleInputErrors,
  OrderController.getOrderByTableId)
routes.get('/:orderId/items',
  param('orderId').isInt().withMessage('El id de la orden no es valido.'),
  validateToken,
  authorizeRole(['administrador', 'mesero']),
  validateOrderExist,
  handleInputErrors,
  OrderController.getOrderItems)
routes.get('/:orderId',
  param('orderId').isInt().withMessage('El id de la orden no es valido.'),
  validateOrderExist,
  validateToken,
  authorizeRole(['administrador', 'cocinero','mesero']),
  handleInputErrors,
  OrderController.getOrderById)
routes.get('/:orderId/details',
  param('orderId').isInt().withMessage('El id de la orden no es valido.'),
  validateToken,
  authorizeRole(['administrador']),
  handleInputErrors,
  OrderController.getOrderDetailsHistoryById)
routes.get('/:orderId/summary',
  param('orderId').isInt().withMessage('El id de la orden no es valido.'),
  validateToken,
  authorizeRole(['administrador', 'mesero']),
  validateOrderExist,
  handleInputErrors,
  OrderController.getOrderSummary)
routes.patch('/:orderId/status',
  param('orderId').isInt().withMessage('El id de la orden no es valido.'),
  validateToken,
  authorizeRole(['administrador', 'mesero']),
  validateOrderExist,
  handleInputErrors,
  OrderController.updateOrderStatus)
routes.patch('/:orderId/item/:itemId/status',
  param('orderId').isInt().withMessage('El id de la orden no es valido.'),
  param('itemId').isInt().withMessage('El id del item no es valido.'),
  validateToken,
  authorizeRole(['administrador', 'cocinero', 'mesero']),
  validateUpdateOrderItemsStatus,
  validateOrderExist,
  handleInputErrors,
  OrderController.updateOrderItemStatus)
routes.patch('/:orderId/cancel',
  param('orderId').isInt().withMessage('El id de la orden no es valido.'),
  validateToken,
  authorizeRole(['administrador', 'mesero']),
  validateOrderExist,
  handleInputErrors,
  OrderController.cancelOrder)
routes.patch('/:orderId/send-to-kitchen',
  param('orderId').isInt().withMessage('El id de la orden no es valido.'),
  validateToken,
  authorizeRole(['administrador', 'mesero']),
  validateOrderExist,
  handleInputErrors,
  OrderController.sendOrderToKitchen)
routes.post('/:orderId/payment',
  param('orderId').isInt().withMessage('El id de la orden no es valido.'),
  validateToken,
  authorizeRole(['administrador', 'mesero']),
  validateOrderPayment,
  validateOrderExist,
  handleInputErrors,
  OrderController.processPaymentOrder)

export default routes;
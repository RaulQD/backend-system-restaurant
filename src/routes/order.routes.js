import Router from 'express';
import { OrderController } from '../controllers/OrderController.js';
import { authorizeRole, validateToken } from '../middlewares/auth.js';
import { handleInputErrors } from '../middlewares/validation.js';
import { param } from 'express-validator';
import { orderValidation, validateOrderActiveForTable, validateOrderExist } from '../middlewares/order.js';
import { validateEmployeeExist } from '../middlewares/employee.js';
import { validateTableExist } from '../middlewares/table.js';
import { validateDishExist } from '../middlewares/dish.js';

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
  handleInputErrors,
  authorizeRole(['administrador', 'mesero']), 
  OrderController.removeItemFromOrder);
routes.patch('/:orderId/decrease-quantity', 
  param('orderId').isInt().withMessage('El id de la orden no es valido.'),
  validateOrderExist,
  validateToken, 
  authorizeRole(['administrador', 'mesero']), 
  handleInputErrors,
  OrderController.decreaseItemQuantity)
routes.get('/', OrderController.getOrders)
routes.get('/kitchen', 
  validateToken, 
  authorizeRole(['administrador', 'cocinero']), 
  OrderController.getOrdersForKitchen)
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
  handleInputErrors,
  OrderController.getOrderItems)
routes.get('/:orderId', 
  param('orderId').isInt().withMessage('El id de la orden no es valido.'),
  validateOrderExist,
  validateToken, 
  authorizeRole(['administrador', 'cocinero']), 
  handleInputErrors,
  OrderController.getOrderById)
routes.get('/:orderId/summary', 
  param('orderId').isInt().withMessage('El id de la orden no es valido.'),
  validateToken, 
  authorizeRole(['administrador', 'mesero']), 
  handleInputErrors,  
  OrderController.getOrderSummary)
routes.patch('/:orderId/status', 
  param('orderId').isInt().withMessage('El id de la orden no es valido.'),
  validateToken, 
  authorizeRole(['administrador', 'mesero']), 
  handleInputErrors, 
  OrderController.updateOrderStatus)
routes.patch('/:orderId/item/:itemId/status', 
  param('orderId').isInt().withMessage('El id de la orden no es valido.'),
  param('itemId').isInt().withMessage('El id del item no es valido.'),
  validateToken, 
  authorizeRole(['administrador', 'cocinero','mesero']), 
  handleInputErrors,
  OrderController.updateOrderItemStatus)
routes.patch('/:orderId/cancel', 
  param('orderId').isInt().withMessage('El id de la orden no es valido.'),
  validateToken, 
  authorizeRole(['administrador', 'mesero']), 
  handleInputErrors,
  OrderController.cancelOrder)
routes.patch('/:orderId/send-to-kitchen', 
  param('orderId').isInt().withMessage('El id de la orden no es valido.'),
  validateToken, 
  authorizeRole(['administrador', 'mesero']),
  handleInputErrors, 
  OrderController.sendOrderToKitchen)
routes.post('/:orderId/payment', 
  param('orderId').isInt().withMessage('El id de la orden no es valido.'),
  validateToken, 
  authorizeRole(['administrador', 'mesero']), 
  handleInputErrors,
  OrderController.processPaymentOrder)

export default routes;
import { DishesModel } from "../models/Dishes.js";
import { OrderItemsModel } from "../models/orderItems.js";
import { OrderModel } from "../models/orders.js";
import { TableModel } from "../models/table.js";

export class OrderController {

  static async createOrder(req, res) {
    const { employee_id, table_id, order_items } = req.body
    try {
      let total = 0;
      // Check if the table is already occupied
      const tableId = await TableModel.getTableById(table_id);
      if (tableId.status === 'Ocupado') {
        const error = new Error('La mesa ya esta ocupada')
        error.statusCode = 400
        throw error
      }
      console.log('id de la mesa:', tableId)
      //añadir validación de que el empleado existe
      const employee = await EmployeeModel.getEmployeeById(employee_id);
      const employeId = employee.id;

      // Create the order
      const result = await OrderModel.createOrder({ employeId, tableId });
      const orderId = result.insertId;
      console.log('id de la orden:', orderId)
      // Agregar los ítems (platos) al pedido
      const orderItems = items.map(item => ({
        order_id: orderId,
        dish_id: item.dish_id,
        quantity: item.quantity,
        price: item.price
      }));
      await OrderItemsModel.createOrderItems(orderItems);
      console.log('items:', orderItems)
      // // update the total
      // for (let item of order_items) {
      //   const { dish_id, quantity, price } = item
      //   const dish = await DishesModel.getDishById(dish_id);
      //   console.log(dish)
      //   total += dish.price * quantity;
      //   await OrderItemsModel.createOrderItems({ orderId, dish_id, quantity, price });
      // }
      // // Update the total
      // const updatedTotal = await OrderModel.updateTotal(orderId, total);
      // console.log('total', updatedTotal)
      // Update the table status
      const upodateStatus = await TableModel.updateTableStatus(tableId, 'Ocupado');
      console.log('status :', upodateStatus)
      // Return the order
      return res.status(201).json({ message: 'Orden creada exitosamente', status: true, orderId, total })
    } catch (error) {
      console.log(error)
      const statusCode = error.statusCode || 500; // Si no hay statusCode, se usará 500
      return res.status(statusCode).json({
        message: error.message || 'Error interno del servidor',
        status: false // Mostrar que no se pudo realizar la oper
      });
    }
  }
}
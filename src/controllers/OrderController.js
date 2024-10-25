import { DishesModel } from "../models/Dishes.js";
import { EmployeeModel } from "../models/employees.js";
// import { OrderItemsModel } from "../models/orderItems.js";
import { OrderModel } from "../models/orders.js";
import { TableModel } from "../models/table.js";

export class OrderController {

  static async createOrder(req, res) {

    const { employee_id, table_id, items } = req.body
    const employeeId = await EmployeeModel.findByEmployeeId(employee_id)
    if (!employeeId) {
      return res.status(404).json({ message: 'Empleado no encontrado', status: false });
    }
    const tableId = await TableModel.getTableById(table_id)
    if (!tableId) {
      return res.status(404).json({ message: 'Mesa no encontrada', status: false });
    }
    try {
      // Crear los items de la orden
      let total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
      const orderData = { employee_id, table_id, total }
      const order = await OrderModel.createOrder(orderData)
      for (const item of items) {
        const orderItemData = {
          order_id: order,
          dish_id: item.dish_id,
          quantity: item.quantity,
          price: item.price
        }
        await OrderModel.addOrderItems(orderItemData)
      }
      res.status(201).json({ message: 'Orden creada exitosamente', statu: true, order });

    } catch (error) {
      console.log(error)
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }
}
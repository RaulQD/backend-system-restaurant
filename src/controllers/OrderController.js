import { DishesModel } from "../models/Dishes.js";
import { EmployeeModel } from "../models/employees.js";
import { OrderItemsModel } from "../models/orderItems.js";
import { OrderModel } from "../models/orders.js";
import { TableModel } from "../models/table.js";

export class OrderController {

  static async createOrder(req, res) {
    const { employee_id, table_id, items } = req.body
    console.log('Body recibido:', req.body); //
    const employeeId = await EmployeeModel.getEmployeeById(employee_id)
    console.log('employeeId:', employeeId)
    const tableId = await TableModel.getTableById(table_id)
    console.log('tableId:', tableId)

    try {
      //Cambiar el estado de la mesa a ocupado
      await TableModel.updateTableStatus(table_id, 'ocupado')

      //CALCULAR EL TOTAL DE LA ORDEN
      const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
      console.log('total:', total)
      //Crear la orden
      // const orderId = await OrderModel.createOrder({ employee_id: employeeId.id, table_id: tableId.id, total })
      // console.log('orderId', orderId)
      res.send('Orden creada')
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
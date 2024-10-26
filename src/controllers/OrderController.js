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
    //VALIDAR SI LA MESA ESTÁ OCUPADA
    const tableStatus = await TableModel.getTableStatus(table_id)
    if (tableStatus === 'Ocupado') {
      return res.status(400).json({ message: 'La mesa ya está ocupada', status: false });
    }
    //VALIDAR SI ESTA VACIO EL ITEM
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No se puede crear una orden, La orden esta vacia.', status: false });
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
      //CAMBIAR EL ESTADO DE LA MESA A OCUPADO
      await TableModel.updateTableStatus(table_id, 'Ocupado')

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
  static async cancelOrder(req, res) {
    const { orderId, tableId } = req.params

    try {
      const order = await OrderModel.getOrderById(orderId)
      if (!order) {
        const error = new Error('Orden no encontrada')
        return res.status(404).json({ message: error.message, status: false });
      }
      //VALIDAR SI LA ORDEN YA ESTÁ CANCELADA O COMPLETADA
      if (order.order_status === 'CANCELADO' || order.order_status === 'COMPLETADO') {
        const error = new Error('La orden ya está cancelada o completada')
        return res.status(400).json({ error: error.message, status: false });
      }
      //VALIDAR PERMISOS DE USUARIO PARA CANCELAR LA ORDEN, SOLO EL ADMINISTRADOR O EL EMPLEADO QUE CREÓ LA ORDEN PUEDE CANCELARLA
      // const user = await EmployeeModel.getEmployeeById(req.user.id)
      // if (user.role.name !== 'administrador' && order.employee_id !== req.user.id) {
      //   const error = new Error('No tienes permisos para cancelar esta orden')
      //   return res.status(403).json({ error: error.message, status: false });
      // }
      //CAMBIAR EL ESTADO DE LA ORDEN A CANCELADO
      await OrderModel.updateOrderStatus(orderId, 'CANCELADO')
      //CAMBIAR EL ESTADO DE LA MESA A DISPONIBLE
      await TableModel.updateTableStatus(tableId, 'Disponible')

      return res.status(200).json({ message: 'Orden cancelada exitosamente', status: true });
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
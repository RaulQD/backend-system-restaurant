import { pool } from "../config/mysql.js";


export class OrderModel {
  static async getOrders() {
    const [results] = await pool.query('SELECT o.id_order, e.names, t.num_table, o.order_status, o.total, o.created_at FROM orders o JOIN employees e ON o.employee_id = e.id_employee JOIN tables t ON o.table_id = t.id_table')
    return results
  }

  static async getOrderById(id) {
    const [results] = await pool.query('SELECT id_order, employee_id, table_id FROM orders WHERE id_order = ?', [id])
    return results[0]
  }

  static async createOrder(orderData) {
    const { employee_id, table_id, total = 0 } = orderData
    try {
      const [result] = await pool.query('INSERT INTO orders (employee_id, table_id, total) VALUES (?,?,?)', [employee_id, table_id, total])
      return result.insertId
    } catch (error) {
      console.log(error)
      throw new Error('Error al crear la orden')

    }
  }

  static async addOrderItems(orderItemData) {
    const { order_id, dish_id, quantity, price } = orderItemData
    try {
      await pool.query('INSERT INTO order_details (order_id, dish_id, quantity, price) VALUES (?,?,?,?)', [order_id, dish_id, quantity, price])
    } catch (error) {
      console.log(error)
      throw new Error('Error al agregar items a la orden')
    }
  }
  
  static async getOrderItems(orderId) {
    try {

      const [results] = await pool.query('SELECT od.id_item, od.quantity, od.price, d.id_dish as id, d.dishes_name FROM order_details od JOIN dishes d ON od.dish_id = d.id_dish WHERE od.order_id = ?', [orderId])
      return results
    } catch (error) {
      console.log(error)
      throw new Error('Error al obtener los items de la orden')
    }
  }

  static async updateTotal(id_order, total) {
    await db.query("UPDATE orders SET total = ? WHERE id_order = ?", [total, id_order]);
  }

  static async updateOrderStatus(orderId, order_status) {
    try {
      await pool.query('UPDATE orders SET order_status = ? WHERE id_order = ?', [order_status, orderId])
    } catch (error) {
      console.log(error);
      throw new Error('Error al actualizar el estado de la orden');
    }
  }
}
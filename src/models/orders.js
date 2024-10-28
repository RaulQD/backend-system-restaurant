import { pool } from "../config/mysql.js";


export class OrderModel {
  static async getOrders() {
    const [results] = await pool.query('SELECT * FROM orders')
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

      const [results] = await pool.query(`SELECT * FROM order_details WHERE order_id = ?`, [orderId])
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
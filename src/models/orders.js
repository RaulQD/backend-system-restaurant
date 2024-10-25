import { pool } from "../config/mysql.js";


export class OrderModel {

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

  static async updateTotal(id_order, total) {
    await db.query("UPDATE orders SET total = ? WHERE id_order = ?", [total, id_order]);
  }

  static async updateStatus(id_order, order_status) {
    await db.query("UPDATE orders SET order_status = ? WHERE id_order = ?", [order_status, id_order]);
  }
}
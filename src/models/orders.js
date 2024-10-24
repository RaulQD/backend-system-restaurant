import { pool } from "../config/mysql.js";


export class OrderModel {
  static async createOrder(data) {
    const { employee_id, table_id, total} = data;

    try {
      const [result] = await pool.query('INSERT INTO orders ( employee_id, table_id, total) VALUES (?,?,?)', [employee_id, table_id, total])
      const orderId = result.insertId;
      console.log('result order:', orderId)
      return orderId;
    } catch (error) {
      console.log(error)
      throw new Error('Error al crear la orden')
    }
  }
  static async updateTotal(id_order, total) {
    await db.query("UPDATE orders SET total = ? WHERE id_order = ?", [total, id_order]);
  }

  static async updateStatus(id_order, order_status) {
    await db.query("UPDATE orders SET order_status = ? WHERE id_order = ?", [order_status, id_order]);
  }
}
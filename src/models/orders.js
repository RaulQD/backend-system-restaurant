import { pool } from "../config/mysql.js";


export class OrderModel {
  static async createOrder({ employee_id, table_id }) {
    const [uuidResult] = await pool.query(`SELECT UUID() uuid`)
    const[{ uuid }] = uuidResult

    try {
      await pool.query(`INSERT INTO orders (id_order, employee_id, table_id) VALUES (UUID_TO_BIN("${uuid}"),UUID_TO_BIN(?),UUID_TO_BIN(?))`, [employee_id, table_id])
    } catch (error) {
      throw new Error('Error al crear la orden')
    }
    const [order] = await pool.query('SELECT BIN_TO_UUID(id_order) id, employee_id, table_id, total FROM orders WHERE id_order = UUID_TO_BIN(?)', [uuid])

    return order[0]
  }
  static async updateTotal(id_order, total) {
    await db.query("UPDATE orders SET total = ? WHERE id_order = UUID_TO_BIN(?)", [total, id_order]);
  }

  static async updateStatus(id_order, order_status) {
    await db.query("UPDATE orders SET order_status = ? WHERE id_order = UUID_TO_BIN(?)", [order_status, id_order]);
  }
}
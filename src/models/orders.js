import { pool } from "../config/mysql.js";


export class OrderModel {
  static async createOrder(data) {
    const { id_table, employee_id, table_id } = data
    const [uuidResult] = await pool.query(`SELECT UUID() uuid`)

    const [order] = await pool.query(`INSERT INTO orders (id_order as id, employee_id, table_id) VALUES (UUID_TO_BIN(UUID()),?,?)`, [employee_id, table_id])

  }
}
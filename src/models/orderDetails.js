import { pool } from "../config/mysql.js"


export class OrderDetailsModel {


  static async getOrderItems(orderId) {
    try {
      const [results] = await pool.query('SELECT od.id_item, od.dish_id, d.dishes_name, od.quantity, od.unit_price, od.subtotal, od.special_requests FROM order_details od JOIN dishes d ON od.dish_id = d.id_dish WHERE od.order_id = ?', [orderId])
      return results
    } catch (error) {
      console.log(error)
      throw new Error('Error al obtener los items de la orden')
    }
  }
  static async addOrderItems(orderItemData) {
    const { order_id, dish_id, quantity, unit_price, subtotal, special_requests } = orderItemData
    try {
      await pool.query('INSERT INTO order_details (order_id, dish_id, quantity, unit_price, subtotal, special_requests) VALUES (?,?,?,?,?,?)', [order_id, dish_id, quantity, unit_price, subtotal, special_requests])
    } catch (error) {
      console.log(error)
      throw new Error('Error al agregar items a la orden')
    }
  }
}
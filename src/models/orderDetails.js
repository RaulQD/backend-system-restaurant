import { pool } from "../config/mysql.js"


export class OrderDetailsModel {

  static async getOrderItems(orderId) {
    try {
      const [results] = await pool.query('SELECT od.id_item, od.dish_id, d.dishes_name, od.quantity, od.unit_price, od.status, od.subtotal, d.image_url FROM order_details od JOIN dishes d ON od.dish_id = d.id_dish WHERE od.order_id = ?', [orderId])
      return results
    } catch (error) {
      console.log(error)
      throw new Error('Error al obtener los items de la orden')
    }
  }
  static async getOrderItemById(itemId) {
    try {
      const [results] = await pool.query('SELECT od.id_item, od.dish_id, d.dishes_name, od.quantity, od.unit_price, od.status, od.subtotal, d.image_url FROM order_details od JOIN dishes d ON od.dish_id = d.id_dish WHERE od.id_item = ?', [itemId])
      return results[0]
    } catch (error) {
      console.log(error)
      throw new Error('Error al obtener el item de la orden')
    }
  }
  static async getOrderItemByDishId(orderId, dish_id) {
    try {
      const [results] = await pool.query(`SELECT od.id_item, od.quantity, od.subtotal, d.id_dish as dish_id, d.dishes_name, od.unit_price, o.created_at, od.status FROM order_details od JOIN dishes d ON od.dish_id = d.id_dish JOIN orders o ON od.order_id = o.id_order WHERE od.order_id = ? AND od.dish_id = ? AND od.status = 'PENDIENTE'`, [orderId, dish_id])
      return results.length > 0 ? results[0] : null
    } catch (error) {
      console.log(error)
      throw new Error('Error al obtener el item de la orden')
    }
  }

  static async addOrderItems(orderItemData) {
    const { order_id, dish_id, quantity, unit_price, subtotal } = orderItemData
    try {
      await pool.query('INSERT INTO order_details (order_id, dish_id, quantity, unit_price, subtotal) VALUES (?,?,?,?,?)', [order_id, dish_id, quantity, unit_price, subtotal])
    } catch (error) {
      console.log(error)
      throw new Error('Error al agregar items a la orden')
    }
  }
  static async updateOrderItemQuantity(itemId, quantity, subtotal) {
    try {
      await pool.query('UPDATE order_details SET quantity = ? , subtotal = ? WHERE id_item = ?', [quantity, subtotal, itemId])
    } catch (error) {
      console.log(error);
      throw new Error('Error al actualizar la cantidad del item de la orden');
    }
  }
  static async removeOrderItem(itemId) {
    try {
      await pool.query('DELETE FROM order_details WHERE id_item = ?', [itemId])
    } catch (error) {
      console.log(error)
      throw new Error('Error al eliminar item de la orden')
    }
  }
  static async cancelOrderItems(orderId, status) {
    try {
      await pool.query('UPDATE order_details SET status = ? WHERE order_id = ?', [status, orderId])
    } catch (error) {
      console.log(error)
      throw new Error('Error al eliminar item de la orden')
    }
  }
}
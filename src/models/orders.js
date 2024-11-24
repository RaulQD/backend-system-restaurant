import { pool } from "../config/mysql.js";


export class OrderModel {
  static async getOrders() {
    const [results] = await pool.query(`SELECT o.id_order, o.employee_id, CONCAT(e.names ,' ', e.last_name) AS names, o.table_id, t.num_table , o.order_status, o.total, o.created_at  FROM orders o  JOIN employees e ON o.employee_id = e.id_employee JOIN tables t ON o.table_id = t.id_table`)
    return results
  }

  static async getOrderById(id) {
    const [results] = await pool.query(`SELECT o.id_order, o.employee_id, CONCAT(e.names ,' ', e.last_name) AS names, o.table_id, t.num_table , o.order_status, o.total, o.created_at  FROM orders o  JOIN employees e ON o.employee_id = e.id_employee JOIN tables t ON o.table_id = t.id_table WHERE o.id_order = ?`, [id])
    const order = results[0]

    if (!order) {
      return null;
    }
    // OBTENER LOS ITEMS DE LA ORDEN CON SU ESTADO
    const [itemsRow] = await pool.query('SELECT od.id_item, od.quantity, d.id_dish, d.dishes_name, od.subtotal, od.status, od.special_requests FROM order_details od JOIN dishes d ON od.dish_id = d.id_dish WHERE od.order_id = ?', [id])
    order.items = itemsRow

    return order;
  }

  static async createOrder(orderData) {
    const { employee_id, table_id } = orderData
    try {
      const [result] = await pool.query('INSERT INTO orders (employee_id, table_id, total) VALUES (?,?,0)', [employee_id, table_id])
      return result
    } catch (error) {
      console.log(error)
      throw new Error('Error al crear la orden')

    }
  }
  static async getOrderActiveForTable(tableId) {
    try {
      const [results] = await pool.query('SELECT id_order, employee_id, table_id, order_status, total FROM orders WHERE table_id = ? AND order_status = "PENDIENTE"', [tableId])
      return results[0]
    } catch (error) {
      console.log(error)
      throw new Error('Error al obtener la orden activa de la mesa')
    }
  }

  static async getOrdersByStatus(order_status) {
    const [results] = await pool.query(`SELECT o.id_order, o.employee_id, CONCAT(e.names ,' ', e.last_name) AS names, o.table_id, t.num_table , o.order_status, o.total, o.created_at  FROM orders o  JOIN employees e ON o.employee_id = e.id_employee JOIN tables t ON o.table_id = t.id_table WHERE order_status IN (?)`, [order_status]);
    return results;
  }
  static async getOrderItem(orderId, dishId) {
    try {
      const [results] = await pool.query('SELECT od.id_item, od.quantity, d.id_dish as dish_id, d.dishes_name FROM order_details od JOIN dishes d ON od.dish_id = d.id_dish WHERE od.order_id = ? AND od.dish_id = ?', [orderId, dishId])
      return results[0]
    } catch (error) {
      console.log(error)
      throw new Error('Error al obtener el item de la orden')
    }
  }
  static async getOrderIdAndItemId(orderId, itemId) {
    try {
      const [results] = await pool.query('SELECT od.order_id, od.status, o.order_status FROM order_details od INNER JOIN orders o ON od.order_id = o.id_order WHERE od.id_item = ? AND o.id_order = ?', [itemId, orderId]);
      return results[0];
    } catch (error) {
      console.log(error);
      throw new Error('Error al obtener el id del item de la orden');
    }
  }
  static async updateTotal(id_order, total) {
    try {
      await pool.query("UPDATE orders SET total = ? WHERE id_order = ?", [total, id_order]);
    } catch (error) {
      console.log(error);
      throw new Error('Error al actualizar el total de la orden');
    }
  }

  static async updateOrderStatus(orderId, order_status) {
    try {
      await pool.query('UPDATE orders SET order_status = ? WHERE id_order = ?', [order_status, orderId])
    } catch (error) {
      console.log(error);
      throw new Error('Error al actualizar el estado de la orden');
    }
  }
  static async updateOrderItemStatus(orderId, itemId, status) {
    try {
      await pool.query('UPDATE order_details SET status = ? WHERE order_id = ? AND id_item = ?', [status, orderId, itemId])
    } catch (error) {
      console.log(error);
      throw new Error('Error al actualizar el estado del item de la orden');
    }
  }
  static async updateOrderItemQuantity(orderId, dishId, quantity) {
    try {
      await pool.query('UPDATE order_details SET quantity = ? WHERE order_id = ? AND dish_id = ?', [quantity, orderId, dishId])
    } catch (error) {
      console.log(error);
      throw new Error('Error al actualizar la cantidad del item de la orden');
    }
  }

}
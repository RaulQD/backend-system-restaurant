import { pool } from "../config/mysql.js";


export class OrderModel {
  static async getOrders(status, keyword, startDate, endDate, page = 1, limit = 10) {
    let offset = (page - 1) * limit;

    let query = `SELECT o.id_order, e.id_employee, e.names, e.last_name, t.id_table, t.num_table , o.order_status,o.order_number, o.total, o.created_at, o.updated_at FROM orders o JOIN employees e ON o.employee_id = e.id_employee JOIN tables t ON o.table_id = t.id_table WHERE 1=1`	// Consulta para obtener las ordenes

    let countQuery = `SELECT COUNT(*) as total FROM orders o JOIN employees e ON o.employee_id = e.id_employee JOIN tables t ON o.table_id = t.id_table WHERE 1=1`	// Consulta para contar el número total de ordenes

    const queryParams = []	// Parámetros de la consulta
    const countParams = []; // Parámetros de la consulta de conteo
    if (keyword) {
      query += ` AND (LOWER(CONCAT(e.names, ' ', e.last_name)) LIKE LOWER(CONCAT('%', ?, '%'))) 
                      OR o.order_number LIKE CONCAT('%', ?, '%')`
      countQuery += ` AND (LOWER(CONCAT(e.names, ' ', e.last_name)) LIKE LOWER(CONCAT('%', ?, '%'))) 
                          OR o.order_number LIKE CONCAT('%', ?, '%')`
      queryParams.push(keyword, keyword);
      countParams.push(keyword, keyword);
    }
    if (status) {
      query += ` AND o.order_status = ?`
      countQuery += ` AND o.order_status = ?`
      queryParams.push(status);
      countParams.push(status);
    }
    if (startDate && endDate) {
      query += ` AND o.created_at BETWEEN ? AND ?`
      countQuery += ` AND o.created_at BETWEEN ? AND ?`
      queryParams.push(startDate, endDate);
      countParams.push(startDate, endDate);
    }
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const [countResults] = await pool.query(countQuery, countParams)
    const totalOrders = countResults[0].total;
    if (totalOrders === 0) {
      if (status) {
        const error = new Error(`No se encontraron ordenes con el estado ${status}.`);
        error.statusCode = 404;
        throw error;
      } else if (keyword) {
        const error = new Error(`No se encontraron empleados con este nombre ${keyword} .`);
        error.statusCode = 404;
        throw error;
      } else if (startDate && endDate) {
        const error = new Error(`No se encontraron ordenes entre ${startDate} y ${endDate}.`);
        error.statusCode = 404;
        throw error
      } else {
        const error = new Error('No se encontraron ordenes completados o canceladas.');
        error.statusCode = 404;
        throw error;
      }
    }
    // Ejecutar la consulta para obtener las ordenes con paginación
    const countQueryParams = [...queryParams];
    const [ordersResult] = await pool.query(query, countQueryParams)
    if (ordersResult.length === 0) {
      const error = new Error('No se encontraron ordenes con estos criterios de busqueda.')
      error.statusCode = 404;
      throw error
    }
    const orders = ordersResult.map(order => {
      return {
        id_order: order.id_order,
        employee: {
          id_employee: order.id_employee,
          names: order.names,
          last_name: order.last_name
        },
        tables: {
          id_table: order.id_table,
          num_table: order.num_table
        },
        order_status: order.order_status,
        order_number: order.order_number,
        total: order.total,
        created_at: order.created_at,
        updated_at: order.updated_at
      }
    })
    return {
      results: orders,
      pagination: {
        page,
        limit,
        totalOrders
      }
    }

  }

  static async getOrderById(id) {
    const [results] = await pool.query(`SELECT o.id_order, o.employee_id, CONCAT(e.names ,' ', e.last_name) AS names, o.table_id, t.num_table , o.order_status, o.total, o.created_at  FROM orders o JOIN employees e ON o.employee_id = e.id_employee JOIN tables t ON o.table_id = t.id_table WHERE o.id_order = ?`, [id])
    const order = results[0]

    if (!order) {
      return null;
    }
    // OBTENER LOS ITEMS DE LA ORDEN CON SU ESTADO
    const [itemsRow] = await pool.query('SELECT od.id_item, od.quantity, d.id_dish, d.dishes_name, od.unit_price, od.subtotal, od.status FROM order_details od JOIN dishes d ON od.dish_id = d.id_dish WHERE od.order_id = ?', [id])
    order.items = itemsRow

    return order;
  }
  static async getLastNumberOrder() {
    try {
      const [results] = await pool.query('SELECT order_number FROM orders  ORDER BY id_order DESC LIMIT 1')
      return results.length ? results[0] : null
    } catch (error) {
      console.log(error)
      throw new Error('Error al obtener el último número de orden')
    }
  }
  static async createOrder(orderData) {
    const { employee_id, table_id, order_number } = orderData
    try {
      const [result] = await pool.query('INSERT INTO orders (employee_id, table_id, order_number, total) VALUES (?,?,?,0)', [employee_id, table_id, order_number])
      return result
    } catch (error) {
      console.log(error)
      throw new Error('Error al crear la orden')
    }
  }
  static async getOrderActiveForTable(tableId) {
    try {
      const [results] = await pool.query('SELECT id_order, employee_id, table_id, order_status,order_number, total FROM orders WHERE table_id = ? AND order_status IN (?,?,?,?,?,?)', [tableId, 'CREADO', 'PENDIENTE', 'EN PROCESO', 'LISTO PARA SERVIR', 'SERVIDO', 'LISTO PARA PAGAR'])
      return results[0] || null // Devuelve la orden activa o null si no hay orden activa
    } catch (error) {
      console.log(error)
      throw new Error('Error al obtener la orden activa de la mesa')
    }
  }

  static async getOrdersByStatus(order_status) {
    try {
      const [results] = await pool.query(`SELECT o.id_order,o.order_number, o.employee_id, e.names , e.last_name , o.table_id, t.num_table , o.order_status, o.total, o.created_at  FROM orders o  JOIN employees e ON o.employee_id = e.id_employee JOIN tables t ON o.table_id = t.id_table WHERE order_status IN (?)`, [order_status]);
      return results;
    } catch (error) {
      console.log(error);
      throw new Error('Error al obtener las ordenes por estado');
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

      // Consultar el nuevo total después de actualizar
      const [updatedOrder] = await pool.query("SELECT total FROM orders WHERE id_order = ?", [id_order]);

      return updatedOrder[0]?.total || 0;
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
  static async updateOrderItemQuantity(orderId, dishId, quantity, subtotal) {
    try {
      await pool.query('UPDATE order_details SET quantity = ? , subtotal = ? WHERE order_id = ? AND dish_id = ?', [quantity, subtotal, orderId, dishId])
    } catch (error) {
      console.log(error);
      throw new Error('Error al actualizar la cantidad del item de la orden');
    }
  }
  static async sendOrderToKitchen(orderId) {
    try {
      await pool.query('UPDATE orders SET order_status = ? WHERE id_order = ? ', ['PENDIENTE', orderId])
    } catch (error) {
      console.log(error);
      throw new Error('Error al enviar la orden a cocina');
    }
  }
  static async getOrderSummary(orderId) {
    try {
      const [results] = await pool.query('SELECT MAX(od.id_item) as id_item,od.dish_id, d.dishes_name, SUM(od.subtotal) as subtotal, SUM(od.quantity) as quantity, od.unit_price FROM order_details od JOIN dishes d ON od.dish_id = d.id_dish WHERE od.order_id = ? GROUP BY od.dish_id, od.unit_price ,d.dishes_name', [orderId])
      return results
    } catch (error) {
      console.log(error);
      throw new Error('Error al obtener el resumen de la orden  ');
    }
  }
  static async insertPayments(paymentData) {
    const { orderId, employee_id, total_paid, change_amount, amount_received } = paymentData
    try {
      await pool.query('INSERT INTO payments (order_id, total_paid, change_amount, amount_received,employee_id) VALUES (?,?,?,?,?)', [orderId, total_paid, change_amount, amount_received, employee_id])
    } catch (error) {
      console.log(error);
      throw new Error('Error al registrar el pago de la orden.');
    }
  }

}
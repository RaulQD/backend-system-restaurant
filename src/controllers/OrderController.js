import { pool } from "../config/mysql.js";
import { DishesModel } from "../models/Dishes.js";
import { EmployeeModel } from "../models/employees.js";
import { OrderDetailsModel } from "../models/orderDetails.js";
import { OrderModel } from "../models/orders.js";
import { TableModel } from "../models/table.js";
import { determinateOrderStatus, generateOrderNumber } from "../utils/orders/orderHelper.js";

export class OrderController {
  static async getOrders(req, res) {
    const { keyword = '', status = '', startDate, endDate, page, limit } = req.query
    const limitNumber = Number(limit) || 10
    const pageNumber = Number(page) || 1
    try {
      const orders = await OrderModel.getOrders(status, keyword, startDate, endDate, pageNumber, limitNumber)
      if (orders.results.length === 0) {
        return res.status(404).json({ message: 'No hay ordenes disponibles.', status: false });
      }
      return res.status(200).json(orders || []);
    } catch (error) {
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }
  static async getOrderItems(req, res) {
    const { orderId } = req.params
    try {
      const orderItems = await OrderDetailsModel.getOrderItems(orderId)
      if (orderItems.length === 0) {
        return res.status(404).json({ message: 'No hay items en la orden', status: false });
      }
      return res.status(200).json(orderItems);
    }
    catch (error) {
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }
  static async getOrdersForKitchen(req, res) {
    try {
      const orders = await OrderModel.getOrdersByStatus(['PENDIENTE', 'EN PROCESO', 'LISTO PARA SERVIR', 'SERVIDO', 'LISTO PARA PAGAR'])
      if (!orders.length) {
        const error = new Error('No hay ordenes pendientes para la cocina.')
        return res.status(404).json({ message: error.message, status: false });
      }

      const ordersData = orders.map(order => {
        return {
          id_order: order.id_order,
          order_number: order.order_number,
          order_status: order.order_status,
          employee: {
            id_employee: order.employee_id,
            names: order.names,
            last_name: order.last_name
          },
          table: {
            id_table: order.table_id,
            num_table: order.num_table
          },
          total: order.total,
          minutes_elapsed: order.minutes_elapsed,
          created_at: order.created_at
        }
      })

      return res.status(200).json(ordersData);
    } catch (error) {
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }

  static async getOrderById(req, res) {
    try {
      const order = req.order
      // Obtener los ítems de la orden
      const orderItems = await OrderDetailsModel.getOrderItems(order.id_order)
      // Validar si la orden tiene ítems
      if (!orderItems || orderItems.length === 0) {
        req.order.items = []; // Asignar un array vacío si no hay ítems
        req.order.message = "Esta orden no tiene ningún ítem adjuntado."; // Mensaje informativo
      } else {
        req.order.items = orderItems; // Asignar los ítems si existen
      }

      return res.status(200).json(order);
    } catch (error) {
      console.log(error)
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }

  static async getOrderByTableId(req, res) {
    try {
      const order = req.order
      const orderItems = await OrderDetailsModel.getOrderItems(order.id_order)
      const orderData = {
        id_order: order.id_order,
        order_number: order.order_number,
        order_status: order.order_status,
        total: order.total,
        table_id: order.table_id,
        employee: {
          id: order.employee_id,
          name: order.employee_name
        },
        items: orderItems
      };
      return res.status(200).json(orderData);
    } catch (error) {
      console.log(error)
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }
  static async createOrder(req, res) {
    try {
      const { employee_id, table_id } = req.body

      //obtener el siguiente número de orden
      const lastOrder = await OrderModel.getLastNumberOrder()
      const newOrderNumber = generateOrderNumber(lastOrder.order_number)

      const existingEmployee = await EmployeeModel.findByEmployeeId(employee_id)
      const employeeId = existingEmployee.id_employee
      if (!existingEmployee) {
        return res.status(404).json({ message: 'Empleado no encontrado', status: false });
      }
      const tableId = await TableModel.getTableById(table_id)
      if (!tableId) {
        return res.status(404).json({ message: 'Mesa no encontrada', status: false });
      }
      //CREAR LA ORDEN SIN ITEMS
      const orderData = { employee_id, table_id, order_number: newOrderNumber }
      const order = await OrderModel.createOrder(orderData)
      const orderId = order.insertId

      //CAMBIAR EL ESTADO DE LA MESA A OCUPADO
      await TableModel.updateTableStatus(table_id, 'OCUPADO')

      return res.status(201).json({
        message: 'Orden creada exitosamente',
        statu: true,
        order: {
          id_order: orderId,
          table_id: table_id,
          employe_id: employeeId,
          order_number: newOrderNumber,
          items: []
        }
      });

    } catch (error) {
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }
  static async addItemToOrder(req, res) {
    try {
      const { dish_id, quantity } = req.body
      const order = req.order
      //VERIFICAR SI EL ESTADO DE LA ORDEN ESTA LISTO PARA PAGAR PARA CAMBIARLO A PENDIENTE SI SE AGREGA UN NUEVO ITEM
      if (order.order_status === 'LISTO PARA PAGAR') {
        await OrderModel.updateOrderStatus(order.id_order, 'PENDIENTE')
      } else if (order.order_status === 'LISTO PARA SERVIR') {
        await OrderModel.updateOrderStatus(order.id_order, 'EN PROCESO')
      }
      const dish = await DishesModel.getDishById(dish_id);
      if (!dish) {
        return res.status(404).json({ message: `Plato con ID ${dish_id} no encontrado`, status: false });
      }

      //VALIDAR SI EL ITEM YA EXISTE EN LA ORDEN PARA ACTUALIZAR LA CANTIDAD
      const existingItem = await OrderDetailsModel.getOrderItemByDishId(order.id_order, dish_id)
      if (existingItem) {
        // Sumar la cantidad nueva a la existente
        const newQuantity = Number(existingItem.quantity) + Number(quantity);
        // Calcular el nuevo subtotal basado en el precio unitario
        const newSubtotal = newQuantity * Number(existingItem.unit_price);
        // Actualizar en la base de datos
        await OrderDetailsModel.updateOrderItemQuantity(existingItem.id_item, newQuantity, newSubtotal);

      } else {
        //INSERTAR UN NUEVO ITEM A LA ORDEN SI NO EXISTE
        const orderItemData = {
          order_id: order.id_order,
          dish_id,
          quantity: Number(quantity),
          unit_price: Number(dish.price),
          subtotal: Number(dish.price) * Number(quantity),
        }
        await OrderDetailsModel.addOrderItems(orderItemData)
      }
      // Obtener todos los ítems actuales de la orden
      const orderItems = await OrderDetailsModel.getOrderItems(order.id_order);
      const totalAmount = orderItems.reduce((acc, item) => acc + Number(item.subtotal || 0), 0);
      const updatedTotal = await OrderModel.updateTotal(order.id_order, totalAmount);
      return res.status(201).json({
        message: 'Plato agregado exitosamente.',
        order: {
          order_id: order.id_order, total_amount: updatedTotal,
          items: orderItems,
        }
      });
    } catch (error) {
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }
  static async decreaseItemQuantity(req, res) {
    const statusOptions = ['SERVIDO', 'LISTO PARA SERVIR', 'EN PREPARACION', 'LISTO PARA PAGAR', 'CANCELADO']

    try {
      const { itemId, quantity } = req.body
      const order = req.order

      // Validar si el ítem existe en la orden y si su estado es PENDIENTE
      const orderItem = await OrderDetailsModel.getOrderItemById(itemId);
      if (!orderItem) {
        return res.status(404).json({ message: 'El plato no existe en la orden', status: false });
      }
      // VALIDAR QUE NO SE MODIFIQUEN ITEMS SERVIDOS
      if (statusOptions.includes(orderItem.status.toUpperCase().trim())) {
        return res.status(400).json({ message: 'No se puede modificar el ítem porque su estado no permite cambios.', status: false });
      }
      let updatedTotal;
      if (orderItem.quantity > 1) {
        // Calcular nueva cantidad y subtotal
        const newQuantity = orderItem.quantity - quantity;
        const newSubtotal = newQuantity * parseFloat(orderItem.unit_price);
        // Actualizar la cantidad en la base de datos
        await OrderDetailsModel.updateOrderItemQuantity(orderItem.id_item, newQuantity, newSubtotal);

      } else {
        // Si la cantidad es 1, eliminar el ítem de la orden
        await OrderDetailsModel.removeOrderItem(orderItem.id_item);
      }
      //ACTUALIZAR EL TOTAL DE LA ORDEN
      const orderItems = await OrderDetailsModel.getOrderItems(order.id_order)
      const total = orderItems.reduce((acc, item) => acc + Number(item.subtotal || 0), 0);
      updatedTotal = await OrderModel.updateTotal(order.id_order, total);
      const hasPendingOrderItems = orderItems.some(item => item.status === 'PENDIENTE');
      if (orderItems.length === 0) {
        await OrderModel.updateOrderStatus(order.id_order, 'CREADO')
      } else if (!hasPendingOrderItems) {
        await OrderModel.updateOrderStatus(order.id_order, 'LISTO PARA PAGAR')
      }

      return res.status(200).json({
        message: orderItem.quantity > quantity ? 'Cantidad disminuida exitosamente.' : 'Ítem eliminado de la orden exitosamente', order: {
          id: order.id_order,
          total_amount: updatedTotal,
          items: orderItems,
        }
      });
    } catch (error) {
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }
  static async removeItemFromOrder(req, res) {
    try {
      const order = req.order
      const { itemId } = req.body
      //VALIDAR SI EL ITEM DE LA ORDEN EXISTE
      const orderItem = await OrderDetailsModel.getOrderItemById(itemId)
      if (!orderItem) {
        return res.status(404).json({ message: 'El plato no existe en la orden', status: false });
      }
      const { subtotal } = orderItem;
      //ELIMINAR EL ITEM DE LA ORDEN
      await OrderDetailsModel.removeOrderItem(orderItem.id_item)
      const updatedTotal = await OrderModel.updateTotal(order.id_order, subtotal);
      return res.status(200).json({ message: 'Item eliminado de la orden exitosamente', newTotal: updatedTotal, order: { ...order, items: orderItem } });
    } catch (error) {
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }
  static async updateOrderStatus(req, res) {
    try {
      const { order_status } = req.body
      const order = req.order

      //ACTUALIZAR EL ESTADO DE LA ORDEN
      await OrderModel.updateOrderStatus(order.id_order, order_status)
      return res.status(200).json({ message: 'Estado de la orden actualizado exitosamente', status: true });
    } catch (error) {
      console.log(error)
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }
  static async updateOrderItemStatus(req, res) {

    try {
      const { orderId, itemId } = req.params
      const { status } = req.body
      const ALLOWED_STATUS = ['PENDIENTE', 'EN PREPARACION', 'LISTO PARA SERVIR', 'SERVIDO'];

      //VALIDAR SI EL ESTADO PROPORCIONADO ES VÁLIDO
      if (!ALLOWED_STATUS.includes(status)) {
        const error = new Error('El estado proporcionado no es válido.')
        return res.status(400).json({ message: error.message, status: false });
      }
      //VALIDAR SI EL ITEM DE LA ORDEN EXISTE
      const orderAndItemExits = await OrderModel.getOrderIdAndItemId(orderId, itemId)
      if (!orderAndItemExits) {
        const error = new Error('Orden o item no encontrado')
        return res.status(404).json({ message: error.message, status: false });
      }
      const currentStatus = orderAndItemExits.order_status.trim().toUpperCase();

      //ACTUALIZAR EL ESTADO DEL ITEM DE LA ORDEN
      await OrderModel.updateOrderItemStatus(orderId, itemId, status)

      //OBTENER TODOS LOS ITEMS DE LA ORDEN
      const orderItems = await OrderDetailsModel.getOrderItems(orderId)
      const newOrderStatus = determinateOrderStatus(orderItems, currentStatus)
      if (newOrderStatus && newOrderStatus !== currentStatus) {
        await OrderModel.updateOrderStatus(orderId, newOrderStatus)
      }

      return res.status(200).json({ message: 'Estado del item de la orden actualizado exitosamente', status: true, order_id: orderAndItemExits.order_id });
    } catch (error) {
      console.log(error)
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }
  static async sendOrderToKitchen(req, res) {
    try {
      const order = req.order
      //VALIDAR SI LA ORDEN YA FUE ENVIADA A LA COCINA
      if (order.order_status === 'PENDIENTE' || order.order_status === 'EN PROCESO' || order.order_status === 'LISTO PARA SERVIR' || order.order_status === 'LISTO PARA PAGAR') {
        const error = new Error('La orden ya esta en la cocina.')
        return res.status(400).json({
          message: error.message, status: false
        });
      }
      //VALIDAR SI LA ORDEN TIENE ITEMS.
      const orderItems = await OrderDetailsModel.getOrderItems(order.id_order)
      if (orderItems.length === 0) {
        const error = new Error('No hay items en la orden')
        return res.status(404).json({ message: error.message, status: false });
      }
      //CAMBIAR EL ESTADO DE LA ORDEN A EN PENDIENTE
      await OrderModel.updateOrderStatus(order.id_order, 'PENDIENTE')
      return res.status(200).json({ message: 'Orden enviada a cocina.', status: true });
    } catch (error) {
      console.log(error)
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }
  static async cancelOrder(req, res) {
    const ALLOWED_STATUSES = ['CREADO', 'PENDIENTE'];
    const MAX_CANCEL_TIME = 5; // 5 minutos
    try {
      const order = req.order

      if (!ALLOWED_STATUSES.includes(order.order_status)) {
        const error = new Error('No puedes cancelar esta orden. Estado actual no permite cambios.')
        return res.status(400).json({ message: error.message, status: false });
      }
      //VERIFICAR SI LA ORDEN TIENE MÁS DE 10 MINUTOS CREADO, PARA NO PODER CANCELAR
      const orderDate = new Date(order.created_at).getTime();
      const currentDate = Date.now()
      const minutosElapsed = Math.floor(currentDate - orderDate) / 60000;
      if (minutosElapsed > MAX_CANCEL_TIME && order.order_status === 'PENDIENTE') {
        const error = new Error('No puedes cancelar esta orden. Han pasado más de 5 minutos desde que se creó.')
        return res.status(400).json({ message: error.message, status: false });
      }

      //USAR PROMISE.ALL PARA EJECUTAR VARIAS CONSULTAS ASÍNCRONAS DE FORMA SIMULTÁNEA
      await Promise.all([
        OrderDetailsModel.cancelOrderItems(order.id_order, 'CANCELADO'),
        //CAMBIAR EL ESTADO DE LA ORDEN A CANCELADO
        OrderModel.updateOrderStatus(order.id_order, 'CANCELADO'),
        //CAMBIAR EL ESTADO DE LA MESA A DISPONIBLE
        TableModel.updateTableStatus(order.table_id, 'DISPONIBLE')
      ])

      return res.status(200).json({ message: 'Orden cancelada exitosamente.', status: true });
    } catch (error) {
      console.log(error)
      return res.status(error.statusCode || 500).json({
        message: error.message || 'Ocurrió un error inesperado.',
        status: false
      });
    }
  }
  static async getOrderSummary(req, res) {
    try {
      const order = req.order

      const orderItems = await OrderModel.getOrderSummary(order.id_order)
      if (orderItems.length === 0) {
        return [];
      }
      return res.status(200).json({ orderId: order.id_order, orderItems });
    } catch (error) {
      console.log(error)
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message,
        status: false
      });
    }
  }
  static async processPaymentOrder(req, res) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()
      const { amount_received, employee_id } = req.body
      const order = req.order

      //VERIFICAR SI LA ORDEN ESTA LISTA PARA PAGAR
      if (order.order_status !== 'LISTO PARA PAGAR') {
        const error = new Error('La orden no esta lista para pagar')
        return res.status(400).json({ message: error.message, status: false });
      }
      //VALIDAR EL MONTO RECIBIDO
      if (amount_received < order.total) {
        const error = new Error('El monto recibido es menor al total de la orden')
        return res.status(400).json({ message: error.message, status: false });
      }
      //CALCULAR EL CAMBIO 
      const total_paid = order.total
      const change_amount = (amount_received - total_paid).toFixed(2)
      //OBTENER EL NOMBRE DEL EMPLEADO
      const employee = await EmployeeModel.findByEmployeeId(employee_id)
      if (!employee) {
        return res.status(404).json({ message: 'Empleado no encontrado', status: false });
      }
      const fullname = `${employee.names} ${employee.last_name}`
      //REGISTRAR EL PAGO DE LA ORDEN
      await OrderModel.insertPayments({ orderId: order.id_order, employee_id, total_paid, amount_received, change_amount })

      //CAMBIAR EL ESTADO DE LOS ITEMS DE LA ORDEN A COMPLETADO
      const updateOrderItems = order.items.map(item => OrderModel.updateOrderItemStatus(order.id_order, item.id_item, 'PAGADO'))
      await Promise.all(updateOrderItems)
      //CAMBIAR EL ESTADO DE LA ORDEN A PAGADO
      await OrderModel.updateOrderStatus(order.id_order, 'PAGADO')
      //ACTUALIZAR EL ESTADO DE LA MESA A DISPONIBLE
      await TableModel.updateTableStatus(order.table_id, 'DISPONIBLE')
      //COMMIT DE LA TRANSACCIÓN
      await connection.commit()
      return res.status(200).json({
        message: 'Orden pagada exitosamente',
        status: true,
        payment: {
          order_id: order.id_order,
          total_paid: order.total,
          amount_received,
          change_amount,
          employee_name: fullname
        }
      });
    } catch (error) {
      await connection.rollback();
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message,
        status: false
      });
    } finally {
      connection.release();
    }
  }

}
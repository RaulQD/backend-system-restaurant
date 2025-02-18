import { DishesModel } from "../models/Dishes.js";
import { EmployeeModel } from "../models/employees.js";
import { OrderDetailsModel } from "../models/orderDetails.js";
import { OrderModel } from "../models/orders.js";
import { TableModel } from "../models/table.js";

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
      console.log(error)
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
      console.log(error)
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
          created_at: order.created_at
        }
      })

      return res.status(200).json(ordersData);
    } catch (error) {
      console.log(error)
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
      const orderData = { ...order, items: orderItems }
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
    const { employee_id, table_id } = req.body
    try {

      //obtener el ultimo número de orden de la base de datos
      const lastOrder = await OrderModel.getLastNumberOrder()
      let newOrderNumber = 'FH-000001'
      let prefix = 'FH'

      if (lastOrder) {
        //EXTRAER EL PREFIJO Y EL NUMERO DE ORDEN
        const [lastPrefix, lastNumberStr] = lastOrder.order_number.split('-')

        const lastNumber = parseFloat(lastNumberStr, 10)
        //INCREMENTAR EL NUMERO DE ORDEN
        let nextNumber = lastNumber + 1
        //SI EL NUMERO LLEGA AL LIMITE DE 6 DIGITOS, INCREMENTAR EL PREFIJO
        if (nextNumber > 999999) {
          nextNumber = 1 //REINICIAR EL NUMERO
          prefix = `FH${Number(lastPrefix.replace('FH', '') || 1) + 1}` //INCREMENTAR EL PREFIJO
        } else {
          prefix = lastPrefix
        }
        //FORMATEAR EL NUMERO DE ORDEN
        newOrderNumber = `${prefix}-${String(nextNumber).padStart(6, '0')}`
      }
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
  //METODO PARA AGREGAR ITEMS A UNA ORDEN YA EXISTENTE
  static async addItemToOrder(req, res) {
    const { dish_id, quantity } = req.body
    const order = req.order
    try {
      //VERIFICAR SI EL ESTADO DE LA ORDEN ESTA LISTO PARA PAGAR PARA CAMBIARLO A PENDIENTE
      if (order.order_status === 'LISTO PARA PAGAR') {
        await OrderModel.updateOrderStatus(order.id_order, 'PENDIENTE')
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
  //DISMINUIR LA CANTIDAD DE UN ITEM DE LA ORDEN
  static async decreaseItemQuantity(req, res) {
    try {
      const { itemId, quantity } = req.body
      const order = req.order

      // Validar si el ítem existe en la orden y si su estado es PENDIENTE
      const orderItem = await OrderDetailsModel.getOrderItemById(itemId);
      if (!orderItem) {
        return res.status(404).json({ message: 'El plato no existe en la orden', status: false });
      }

      // VALIDAR QUE NO SE MODIFIQUEN ITEMS SERVIDOS
      if (['SERVIDO', 'LISTO PARA SERVIR', 'EN PREPARACION', 'LISTO PARA PAGAR', 'CANCELADO'].includes(orderItem.status.toUpperCase().trim())) {
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
      console.log(error)
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }

  static async removeItemFromOrder(req, res) {
    try {
      const { orderId } = req.params
      const { itemId } = req.body
      //VALIDAR SI LA ORDEN EXISTE
      const order = await OrderModel.getOrderById(orderId)
      if (!order) {
        return res.status(404).json({ message: 'Orden no encontrada', status: false });
      }
      //VALIDAR SI EL ITEM DE LA ORDEN EXISTE
      const orderItem = await OrderDetailsModel.getOrderItemById(itemId)
      if (!orderItem) {
        return res.status(404).json({ message: 'El plato no existe en la orden', status: false });
      }
      const { subtotal } = orderItem;

      //ELIMINAR EL ITEM DE LA ORDEN
      await OrderDetailsModel.removeOrderItem(orderItem.id_item)

      const updatedTotal = await OrderModel.updateTotal(orderId, subtotal);
      return res.status(200).json({ message: 'Item eliminado de la orden exitosamente', newTotal: updatedTotal, order: { ...order, items: orderItem } });
    } catch (error) {
      console.log(error)
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }
  static async updateOrderStatus(req, res) {
    const { orderId } = req.params
    const { order_status } = req.body
    try {
      const order = await OrderModel.getOrderById(orderId)
      if (!order) {
        const error = new Error('Orden no encontrada')
        return res.status(404).json({ message: error.message, status: false });
      }
      //ACTUALIZAR EL ESTADO DE LA ORDEN
      await OrderModel.updateOrderStatus(orderId, order_status)
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
    const { orderId, itemId } = req.params
    const { status } = req.body
    const ALLOWED_STATUS = ['PENDIENTE', 'EN PREPARACION', 'LISTO PARA SERVIR', 'SERVIDO'];

    if (!status) {
      const error = new Error('El estado es requerido.')
      return res.status(400).json({ message: error.message, status: false });
    }
    try {
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

      //VERIFICAR SI TODOS LOS ITEMS DE LA ORDEN ESTAN SERVIDOS
      const orderItems = await OrderDetailsModel.getOrderItems(orderId)
      const allItemsServed = orderItems.every(item => item.status.trim().toUpperCase() === 'SERVIDO')
      const allItemsReadyToServer = orderItems.every(item => item.status.trim().toUpperCase() === 'LISTO PARA SERVIR')
      const allItemsInPreparation = orderItems.some(item => item.status.trim().toUpperCase() === 'EN PREPARACION')
      const anyItemPending = orderItems.some(item => item.status.trim().toUpperCase() === 'PENDIENTE');

      //ACTUALIZAR EL ESTADO DE LA ORDEN DE ACUERDO A LOS ITEMS DE LA ORDEN 
      if (allItemsServed && currentStatus !== 'LISTO PARA PAGAR') {
        await OrderModel.updateOrderStatus(orderId, 'LISTO PARA PAGAR')
      } else if (allItemsReadyToServer && currentStatus !== 'LISTO PARA SERVIR') {
        await OrderModel.updateOrderStatus(orderId, 'LISTO PARA SERVIR')
      } else if (allItemsInPreparation && currentStatus !== 'EN PROCESO') {
        await OrderModel.updateOrderStatus(orderId, 'EN PROCESO')
      } else if (anyItemPending && !allItemsInPreparation && !allItemsReadyToServer && !allItemsServed) {
        await OrderModel.updateOrderStatus(orderId, 'PENDIENTE');
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
      const { orderId } = req.params
      //VALIDAR SI LA ORDEN EXISTE
      const order = await OrderModel.getOrderById(orderId)
      if (!order) {
        const error = new Error('Orden no encontrada')
        return res.status(404).json({ message: error.message, status: false });
      }
      //VALIDAR SI LA ORDEN YA FUE ENVIADA A LA COCINA
      if (order.order_status === 'PENDIENTE' || order.order_status === 'EN PROCESO' || order.order_status === 'LISTO PARA SERVIR' || order.order_status === 'LISTO PARA PAGAR') {
        const error = new Error('La orden ya esta en la cocina.')
        return res.status(400).json({
          message: error.message, status: false
        });
      }
      //VALIDAR SI LA ORDEN TIENE ITEMS.
      const orderItems = await OrderDetailsModel.getOrderItems(orderId)
      if (orderItems.length === 0) {
        const error = new Error('No hay items en la orden')
        return res.status(404).json({ message: error.message, status: false });
      }
      //CAMBIAR EL ESTADO DE LA ORDEN A EN PENDIENTE
      await OrderModel.updateOrderStatus(orderId, 'PENDIENTE')
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
    const orderStatus = ['CREADO', 'PENDIENTE']
    try {
      const { orderId } = req.params

      const order = await OrderModel.getOrderById(orderId)
      if (!order) {
        const error = new Error('Orden no encontrada.')
        return res.status(404).json({ message: error.message, status: false });
      }

      if (!orderStatus.includes(order.order_status)) {
        const error = new Error('No puedes cancelar esta orden. Estado actual no permite cambios.')
        return res.status(400).json({ message: error.message, status: false });
      }
      //VERIFICAR SI LA ORDEN TIENE MÁS DE 10 MINUTOS CREADO, PARA NO PODER CANCELAR
      const orderDate = new Date(order.created_at).getTime();
      const currentDate = Date.now()
      const minutosElapsed = (currentDate - orderDate) / 60000;
      if (minutosElapsed > 1 && order.order_status === 'PENDIENTE') {
        const error = new Error('No puedes cancelar esta orden. Han pasado más de 10 minutos desde que se creó.')
        return res.status(400).json({ message: error.message, status: false });
      }

      //USAR PROMISE.ALL PARA EJECUTAR VARIAS CONSULTAS ASÍNCRONAS DE FORMA SIMULTÁNEA
      await Promise.all([
        OrderDetailsModel.cancelOrderItems(orderId, 'CANCELADO'),
        //CAMBIAR EL ESTADO DE LA ORDEN A CANCELADO
        OrderModel.updateOrderStatus(orderId, 'CANCELADO'),
        //CAMBIAR EL ESTADO DE LA MESA A DISPONIBLE
        TableModel.updateTableStatus(order.table_id, 'DISPONIBLE')
      ])

      return res.status(200).json({ message: 'Orden cancelada exitosamente.', status: true });
    } catch (error) {
      console.log(error)
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }
  static async getOrderSummary(req, res) {
    const { orderId } = req.params
    try {
      const order = await OrderModel.getOrderById(orderId)
      if (!order) {
        const error = new Error('Orden no encontrada')
        return res.status(404).json({ message: error.message, status: false });
      }
      const orderItems = await OrderModel.getOrderSummary(orderId)
      if (orderItems.length === 0) {
        return [];
      }

      return res.status(200).json({ orderId, orderItems });
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
    const { orderId } = req.params
    const { amount_received, employee_id } = req.body
    try {
      if (!orderId || !amount_received || !employee_id) {
        return res.status(400).json({ message: 'Datos incompletos para procesar el pago', status: false });
      }

      const order = await OrderModel.getOrderById(orderId)
      console.log(order);
      if (!order) {
        const error = new Error('Orden no encontrada')
        return res.status(404).json({ message: error.message, status: false });
      }
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
      await OrderModel.insertPayments({ orderId, employee_id, total_paid, amount_received, change_amount })

      //CAMBIAR EL ESTADO DE LOS ITEMS DE LA ORDEN A COMPLETADO
      const updateOrderItems = order.items.map(item => OrderModel.updateOrderItemStatus(orderId, item.id_item, 'PAGADO'))
      await Promise.all(updateOrderItems)
      //CAMBIAR EL ESTADO DE LA ORDEN A PAGADO
      await OrderModel.updateOrderStatus(orderId, 'PAGADO')
      //ACTUALIZAR EL ESTADO DE LA MESA A DISPONIBLE
      await TableModel.updateTableStatus(order.table_id, 'DISPONIBLE')
      return res.status(200).json({
        message: 'Orden pagada exitosamente',
        status: true,
        payment: {
          order_id: orderId,
          total_paid: order.total,
          amount_received,
          change_amount,
          employee_name: fullname
        }
      });
    } catch (error) {
      console.log(error)
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message,
        status: false
      });
    }
  }

}
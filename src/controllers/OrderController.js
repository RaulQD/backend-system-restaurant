import { DishesModel } from "../models/Dishes.js";
import { EmployeeModel } from "../models/employees.js";
import { OrderDetailsModel } from "../models/orderDetails.js";
import { OrderModel } from "../models/orders.js";
import { TableModel } from "../models/table.js";

export class OrderController {
  static async getOrders(req, res) {
    try {
      const orders = await OrderModel.getOrders()
      if (orders.length === 0) {
        return res.status(404).json({ message: 'No hay ordenes', status: false });
      }
      const orderData = []
      // ITERAR SOBRE LAS ORDENES Y OBTENER LOS DETALLES CORRESPONDIENTES
      for (const order of orders) {
        const orderItems = await OrderDetailsModel.getOrderItems(order.id_order)
        const itemsWithMoreInfo = orderItems.map(item => ({
          id_item: item.id_item,
          dish_id: item.dish_id,
          dishes_name: item.dishes_name,
          quantity: item.quantity,
          price: item.unit_price,
        }))
        orderData.push({ ...order, items: itemsWithMoreInfo })
      }
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
      const orders = await OrderModel.getOrdersByStatus(['PENDIENTE', 'EN PROCESO', 'LISTO PARA SERVIR', 'LISTO PARA PAGAR', 'SERVIDO', 'COMPLETADO'])
      if (orders.length === 0) {
        const error = new Error('No hay ordenes pendientes para la cocina.')
        return res.status(404).json({ message: error.message, status: false });
      }

      return res.status(200).json(orders);
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
    const { orderId } = req.params
    try {
      const order = await OrderModel.getOrderById(orderId)
      if (!order) {
        const error = new Error('Orden no encontrada')
        return res.status(404).json({ message: error.message, status: false });
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

  static async getOrdersByTableId(req, res) {
    const { tableId } = req.params
    const statusAllowed = ['CREADO', 'PENDIENTE', 'EN PROCESO', 'LISTO PARA SERVIR', 'SERVIDO', 'LISTO PARA PAGAR', 'COMPLETADO']
    try {
      const order = await OrderModel.getOrderActiveForTable(tableId)
      if (!order) {
        const error = new Error('No hay orden activa para esta mesa')
        return res.status(404).json({ message: error.message, status: false });
      }
      // const orderId = order.id_order
      if (!statusAllowed.includes(order.order_status)) {
        const error = new Error(`No puedes actualizar esta orden. Estado actual '${order.order_status}' no permite cambios.`)
        return res.status(400).json({ message: error.message, status: false });
      }
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
      const orderData = { employee_id, table_id }
      const order = await OrderModel.createOrder(orderData)
      const orderId = order.insertId

      //CAMBIAR EL ESTADO DE LA MESA A OCUPADO
      await TableModel.updateTableStatus(table_id, 'OCUPADO')

      return res.status(201).json({ message: 'Orden creada exitosamente', statu: true, order: { id_order: orderId, table_id: table_id, employe_id: employeeId, items: [] } });

    } catch (error) {
      console.log(error)
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }
  //METODO PARA AGREGAR ITEMS A UNA ORDEN YA EXISTENTE
  static async addItemToOrder(req, res) {
    const { orderId } = req.params
    const { dish_id, quantity } = req.body

    try {
      //VALIDAR SI LA ORDEN EXISTE
      const order = await OrderModel.getOrderById(orderId)
      if (!order) {
        return res.status(404).json({ message: 'Orden no encontrada', status: false });
      }
      const dish = await DishesModel.getDishById(dish_id);
      if (!dish) {
        return res.status(404).json({ message: `Plato con ID ${dish_id} no encontrado`, status: false });
      }
      //VALIDAR SI EL ITEM YA EXISTE EN LA ORDEN PARA ACTUALIZAR LA CANTIDAD
      const existingItem = await OrderDetailsModel.getOrderItemByDishId(orderId, dish_id)

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
          order_id: orderId,
          dish_id,
          quantity: Number(quantity),
          unit_price: Number(dish.price),
          subtotal: Number(dish.price) * Number(quantity),
        }
        await OrderDetailsModel.addOrderItems(orderItemData)
      }
      // Obtener todos los ítems actuales de la orden
      const orderItems = await OrderDetailsModel.getOrderItems(orderId);
      const totalAmount = orderItems.reduce((acc, item) => acc + Number(item.subtotal || 0), 0);
      const updatedTotal = await OrderModel.updateTotal(orderId, totalAmount);
      return res.status(201).json({
        message: 'Plato agregado exitosamente.',
        order: {
          order_id: orderId, total_amount: updatedTotal,
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
  //DISMINUIR LA CANTIDAD DE UN ITEM DE LA ORDEN
  static async decreaseItemQuantity(req, res) {
    try {
      const { orderId } = req.params
      const { itemId, quantity } = req.body
      //VALIDAR SI LA ORDEN EXISTE
      const order = await OrderModel.getOrderById(orderId)
      if (!order) {
        return res.status(404).json({ message: 'Orden no encontrada', status: false });
      }

      // Validar si el ítem existe en la orden y si su estado es PENDIENTE
      const orderItem = await OrderDetailsModel.getOrderItemById(itemId);
      if (!orderItem) {
        return res.status(404).json({ message: 'El plato no existe en la orden', status: false });
      }
      console.log('Item obtenido:', orderItem);

      // VALIDAR QUE NO SE MODIFIQUEN ITEMS SERVIDOS
      if (['SERVIDO', 'LISTO PARA SERVIR', 'EN PREPARACION', 'CANCELADO'].includes(orderItem.status.toUpperCase().trim())) {
        return res.status(400).json({ message: 'No se puede modificar el ítem porque su estado no permite cambios.', status: false });
      }

      if (orderItem.quantity > 1) {
        // Calcular nueva cantidad y subtotal
        const newQuantity = orderItem.quantity - quantity;
        const newSubtotal = newQuantity * parseFloat(orderItem.unit_price);
        // Actualizar la cantidad en la base de datos
        await OrderDetailsModel.updateOrderItemQuantity(orderItem.id_item, newQuantity, newSubtotal);

      } else {
        // Si la cantidad es 1, eliminar el ítem de la orden
        await OrderDetailsModel.removeOrderItem(orderItem.id_item);
        return res.status(200).json({ message: 'Item eliminado de la orden exitosamente', status: true });
      }
      //ACTUALIZAR EL TOTAL DE LA ORDEN
      const orderItems = await OrderDetailsModel.getOrderItems(orderId)
      const totalAmount = orderItems.reduce((acc, item) => acc + Number(item.subtotal || 0), 0);
      const updatedTotal = await OrderModel.updateTotal(orderId, totalAmount);

      return res.status(200).json({
        message: 'Cantidad disminuida exitosamente', order: {
          id: orderId, total_amount: updatedTotal,
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
      const { dishId } = req.body
      //VALIDAR SI LA ORDEN EXISTE
      const order = await OrderModel.getOrderById(orderId)
      if (!order) {
        return res.status(404).json({ message: 'Orden no encontrada', status: false });
      }
      //VALIDAR SI EL ITEM DE LA ORDEN EXISTE
      const orderItem = await OrderDetailsModel.getOrderItemByDishId(orderId, dishId)
      if (!orderItem) {
        return res.status(404).json({ message: 'El plato no existe en la orden', status: false });
      }
      const { subtotal } = orderItem;

      //ELIMINAR EL ITEM DE LA ORDEN
      await OrderDetailsModel.removeOrderItem(orderItem.id_item)
      const updatedTotal = await OrderModel.updateTotal(orderId, subtotal);
      res.status(200).json({ message: 'Item eliminado de la orden exitosamente', newTotal: updatedTotal, order: { ...order, items: orderItem } });
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
    const ALLOWED_STATUS = ['PENDIENTE', 'EN PREPARACION', 'LISTO PARA SERVIR', 'SERVIDO', 'CANCELADO'];
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

      //ACTUALIZAR EL ESTADO DEL ITEM DE LA ORDEN
      await OrderModel.updateOrderItemStatus(orderId, itemId, status)

      //VERIFICAR SI TODOS LOS ITEMS DE LA ORDEN ESTAN SERVIDOS
      const orderItems = await OrderDetailsModel.getOrderItems(orderId)
      const allItemsServed = orderItems.every(item => item.status.trim().toUpperCase() === 'SERVIDO')
      if (status === 'EN PREPARACION') {
        await OrderModel.updateOrderStatus(orderId, 'EN PROCESO')
      }
      if (status === 'LISTO PARA SERVIR') {
        await OrderModel.updateOrderStatus(orderId, 'LISTO PARA SERVIR')
      }

      if (allItemsServed) {
        await OrderModel.updateOrderStatus(orderId, 'LISTO PARA PAGAR')

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
      const { itemId } = req.body
      const order = await OrderModel.getOrderById(orderId)
      if (!order) {
        const error = new Error('Orden no encontrada')
        return res.status(404).json({ message: error.message, status: false });
      }
      if (!orderStatus.includes(order.order_status)) {
        const error = new Error('No puedes cancelar esta orden. Estado actual no permite cambios.')
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
        const error = new Error('No hay items en la orden')
        return res.status(404).json({ message: error.message, status: false });
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

}
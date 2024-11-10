import { DishesModel } from "../models/Dishes.js";
import { EmployeeModel } from "../models/employees.js";
// import { OrderItemsModel } from "../models/orderItems.js";
import { OrderModel } from "../models/orders.js";
import { TableModel } from "../models/table.js";

export class OrderController {
  static async getOrders(req, res) {
    try {
      const orders = await OrderModel.getOrders()
      if (orders.length === 0) {
        return res.status(404).json({ message: 'No hay ordenes', status: false });
      }
      let orderData = []
      // ITERAR SOBRE LAS ORDENES Y OBTENER LOS DETALLES CORRESPONDIENTES
      for (const order of orders) {
        const orderItems = await OrderModel.getOrderItems(order.id_order)
        const itemsWithMoreInfo = orderItems.map(item => ({
          id_item: item.id_item,
          dish: {
            id: item.id,
            name: item.dishes_name
          },
          quantity: item.quantity,
          price: item.price,

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
  static async getOrderById(req, res) {
    const { orderId } = req.params
    try {
      const order = await OrderModel.getOrderById(orderId)
      if (!order) {
        const error = new Error('Orden no encontrada')
        return res.status(404).json({ error: error.message, status: false });
      }
      const orderItems = await OrderModel.getOrderItems(orderId)
      const itemsWithMoreInfo = orderItems.map(item => ({
        id_item: item.id_item,
        dish: {
          id: item.id,
          name: item.dishes_name
        },
        quantity: item.quantity,
        price: item.price,
      }))

      const orderData = { ...order, items: itemsWithMoreInfo }
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
    const { employee_id, table_id, items } = req.body
    const employeeId = await EmployeeModel.findByEmployeeId(employee_id)
    if (!employeeId) {
      return res.status(404).json({ message: 'Empleado no encontrado', status: false });
    }
    const tableId = await TableModel.getTableById(table_id)
    if (!tableId) {
      return res.status(404).json({ message: 'Mesa no encontrada', status: false });
    }
    //VALIDAR SI LA MESA ESTÁ OCUPADA
    const tableStatus = await TableModel.getTableStatus(table_id)
    if (tableStatus === 'Ocupado') {
      return res.status(400).json({ message: 'La mesa ya está ocupada', status: false });
    }
    //VALIDAR SI ESTA VACIO EL ITEM
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No se puede crear una orden, La orden esta vacia.', status: false });
    }

    try {

      //CREAR LA ORDEN
      const orderData = { employee_id, table_id }
      const order = await OrderModel.createOrder(orderData)
      const orderId = order.insertId
      let totalAmout = 0 // Inicializar el total en 0      
      //AGREGAR LOS ITEMS A LA ORDEN
      for (const item of items) {
        //VERIFICAR SI EL PLATO EXISTE
        const dish = await DishesModel.getDishById(item.dish_id)
        if (!dish) {
          const error = new Error('Plato no encontrado')
          return res.status(404).json({ message: error.message, status: false });
        }
        //CALCULAR EL PRECIO TOTAL DEL ITEM
        const itemTotal = dish.price * item.quantity
        totalAmout += itemTotal
        //VERIFICAR SI EL ITEM YA EXISTE EN LA ORDEN
        const orderItems = await OrderModel.getOrderItems(orderId)
        const existingItem = orderItems.find(orderItem => orderItem.dish_id === item.dish_id)

        if (existingItem) {
          //SI EL ITEM YA EXISTE, ACTUALIZAR LA CANTIDAD
          existingItem.quantity += item.quantity
          await OrderModel.updateOrderItemQuantity(order, item.dish_id, existingItem.quantity)
        } else {
          //SI EL ITEM NO EXISTE, AGREGARLO A LA ORDEN
          const orderItemData = {
            order_id: orderId,
            dish_id: item.dish_id,
            dish_name: item.dish_name,
            quantity: item.quantity,
            price: item.price
          }
          //AGREGAR EL ITEM A LA ORDEN
          await OrderModel.addOrderItems(orderItemData)
        }
      }
      //ACTUALIZAR EL TOTAL DE LA ORDEN
      await OrderModel.updateTotal(orderId, totalAmout)
      //CAMBIAR EL ESTADO DE LA MESA A OCUPADO
      await TableModel.updateTableStatus(table_id, 'Ocupado')

      return res.status(201).json({ message: 'Orden creada exitosamente', statu: true, order: { ...order, id_order: orderId } });

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
    const { order_id, dish_id, quantity, price } = req.body
    //VALIDAR SI LA ORDEN EXISTE
    const order = await OrderModel.getOrderById(order_id)
    console.log('Orden encontrada:', order); // Debug: Ver qué orden se encuentra
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada', status: false });
    }
    try {
      //VALIDAR SI EL ITEM YA EXISTE EN LA ORDEN PARA ACTUALIZAR LA CANTIDAD
      const orderItems = await OrderModel.getOrderItems(order_id)
      console.log('Items de la orden:', orderItems); // Debug: Ver qué items se encuentran
      const existingItem = orderItems.find(item => item.dish_id === dish_id)
      console.log('Item encontrado:', existingItem); // Debug: Ver qué item se encuentra
      if (existingItem) {
        //ACTUALIZAR LA CANTIDAD DEL ITEM
        existingItem.quantity += quantity
        await OrderModel.updateOrderItemQuantity(order_id, dish_id, existingItem.quantity)
      } else {
        //INSERTAR EL NUEVO ITEM EN LA TABLA DE ORDER_DETAILS
        const orderItemData = {
          order_id,
          dish_id,
          quantity,
          price,
        }
        await OrderModel.addOrderItems(orderItemData)
        //AGREGAR EL NUEVO ITEM AL ARRAY DE ITEMS DE LA ORDEN
        orderItems.push(orderItemData)
      }

      const total = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
      //ACTUALIZAR EL TOTAL DE LA ORDEN
      await OrderModel.updateTotal(order_id, total)

      // res.send('Item agregado a la orden exitosamente');
      return res.status(201).json({ message: 'Item agregado a la orden exitosamente', newTotal: total, order: { ...order, items: orderItems } });
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
  static async cancelOrder(req, res) {
    const { orderId, tableId } = req.params

    try {
      const order = await OrderModel.getOrderById(orderId)
      if (!order) {
        const error = new Error('Orden no encontrada')
        return res.status(404).json({ message: error.message, status: false });
      }
      //VALIDAR SI LA ORDEN YA ESTÁ CANCELADA O COMPLETADA
      if (order.order_status === 'CANCELADO' || order.order_status === 'COMPLETADO') {
        const error = new Error('La orden ya está cancelada o completada')
        return res.status(400).json({ error: error.message, status: false });
      }
      //VALIDAR PERMISOS DE USUARIO PARA CANCELAR LA ORDEN, SOLO EL ADMINISTRADOR O EL EMPLEADO QUE CREÓ LA ORDEN PUEDE CANCELARLA
      // const user = await EmployeeModel.getEmployeeById(req.user.id)
      // if (user.role.name !== 'administrador' && order.employee_id !== req.user.id) {
      //   const error = new Error('No tienes permisos para cancelar esta orden')
      //   return res.status(403).json({ error: error.message, status: false });
      // }

      //USAR PROMISE.ALL PARA EJECUTAR VARIAS CONSULTAS ASÍNCRONAS DE FORMA SIMULTÁNEA
      await Promise.all([
        //CAMBIAR EL ESTADO DE LA ORDEN A CANCELADO
        await OrderModel.updateOrderStatus(orderId, 'CANCELADO'),
        //CAMBIAR EL ESTADO DE LA MESA A DISPONIBLE
        await TableModel.updateTableStatus(tableId, 'Disponible')
      ])

      return res.status(200).json({ message: 'Orden cancelada exitosamente', status: true });
    } catch (error) {
      console.log(error)
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }
  // static async getOrderItemsByOrderId(req, res) {
  //   const { orderId } = req.params
  //   try {
  //     const orderItems = await OrderModel.getOrderItemsByOrderId(orderId)
  //     if (!orderItems || orderItems.length === 0) {
  //       return res.status(404).json({ message: 'No hay items en la orden', status: false });
  //     }
  //     return res.status(200).json({ message: 'Items de la orden obtenidos', status: true, items: orderItems });
  //   } catch (error) {
  //     console.log(error)
  //     const statusCode = error.statusCode || 500
  //     return res.status(statusCode).json({
  //       message: error.message, // Mostrar mensaje de error
  //       status: false
  //     });
  //   }
  // }
}
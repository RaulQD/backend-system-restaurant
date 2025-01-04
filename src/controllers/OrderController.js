import { DishesModel } from "../models/Dishes.js";
import { EmployeeModel } from "../models/employees.js";
import { OrderDetailsModel } from "../models/orderDetails.js";
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
  static async getOrdersForKitchen(req, res) {
    try {
      const orders = await OrderModel.getOrdersByStatus(['PENDIENTE', 'EN PROCESO'])
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
    try {
      const order = await OrderModel.getOrderActiveForTable(tableId)
      if (!order) {
        const error = new Error('No hay orden activa para esta mesa')
        return res.status(404).json({ message: error.message, status: false });
      }
      const orderItems = await OrderDetailsModel.getOrderItems(order.id_order)
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

    //VALIDAR SI ESTA VACIO EL ITEM
    // if (items && !Array.isArray(items) || items.length === 0) {
    //   return res.status(400).json({ message: 'No se puede crear una orden, La orden esta vacia.', status: false });
    // }

    try {
      const existingEmployee = await EmployeeModel.findByEmployeeId(employee_id)
      const employeeId = existingEmployee.id
      //obtener el id del empleado
      console.log('Empleado encontrado:', employeeId); // Debug: Ver qué empleado se encuentra

      if (!existingEmployee) {
        return res.status(404).json({ message: 'Empleado no encontrado', status: false });
      }
      const tableId = await TableModel.getTableById(table_id)
      if (!tableId) {
        return res.status(404).json({ message: 'Mesa no encontrada', status: false });
      }
      //VALIDAR SI LA MESA ESTÁ OCUPADA
      const tableStatus = await TableModel.getTableStatus(table_id)
      if (tableStatus === 'OCUPADO') {
        return res.status(400).json({ message: 'La mesa ya está ocupada', status: false });
      }
      //CREAR LA ORDEN
      const orderData = { employee_id, table_id }
      const order = await OrderModel.createOrder(orderData)
      const orderId = order.id_order
      //CAMBIAR EL ESTADO DE LA MESA A OCUPADO
      await TableModel.updateTableStatus(table_id, 'OCUPADO')

      return res.status(201).json({ message: 'Orden creada exitosamente', statu: true, order: { id_order: orderId, table_id: table_id, employe_id: employeeId, items } });

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
    const { dish_id, quantity, special_requests } = req.body
    //VALIDAR SI LA ORDEN EXISTE
    const order = await OrderModel.getOrderById(orderId)
    console.log('Orden encontrada:', order); // Debug: Ver qué orden se encuentra
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada', status: false });
    }
    try {
      const dish = await DishesModel.getDishById(dish_id);
      if (!dish) {
        return res.status(404).json({ message: `Plato con ID ${dish_id} no encontrado`, status: false });
      }
      console.log("dish_id:", dish);
      //VALIDAR SI EL ITEM YA EXISTE EN LA ORDEN PARA ACTUALIZAR LA CANTIDAD
      const existingItem = await OrderDetailsModel.getOrderItemByDishId(orderId, dish_id)
      
      if (existingItem) {
        // Sumar la cantidad nueva a la existente
        existingItem.quantity += quantity;
        // Calcular el nuevo subtotal basado en el precio unitario
        existingItem.subtotal = existingItem.quantity * dish.price;
        // Actualizar en la base de datos
        await OrderModel.updateOrderItemQuantity(orderId, dish_id, existingItem.quantity, existingItem.subtotal);
      } else {
        //INSERTAR EL NUEVO ITEM EN LA TABLA DE ORDER_DETAILS
        const orderItemData = {
          order_id: orderId,
          dish_id,
          quantity,
          unit_price: dish.price,
          subtotal: dish.price * quantity,
          special_requests: special_requests || '',
        }
        await OrderDetailsModel.addOrderItems(orderItemData)
      }
      // Obtener todos los ítems actuales de la orden
      const orderItems = await OrderDetailsModel.getOrderItems(orderId);
      const totalAmount = orderItems.reduce((acc, item) => acc + item.subtotal, 0);
      await OrderModel.updateTotal(orderId, totalAmount);

      // res.send('Item agregado a la orden exitosamente');
      return res.status(201).json({ message: 'Item agregado a la orden exitosamente', newTotal: roundedTotal, order: { ...order, items: orderItems } });
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
    const ALLOWED_STATUSES = ['PENDIENTE', 'EN PREPARACION', 'SERVIDO', 'CANCELADO'];

    if (!status) {
      const error = new Error('El estado es requerido.')
      return res.status(400).json({ message: error.message, status: false });
    }

    try {
      //VALIDAR SI EL ESTADO PROPORCIONADO ES VÁLIDO
      if (!ALLOWED_STATUSES.includes(status)) {
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
      console.log('Items de la orden:', orderItems); // Debug: Ver qué items se encuentran
      console.log('Todos los items servidos:', allItemsServed); // Debug: Ver si todos los items están servidos
      if (status === 'EN PREPARACION') {
        await OrderModel.updateOrderStatus(orderId, 'EN PROCESO')
      }

      if (allItemsServed) {
        await OrderModel.updateOrderStatus(orderId, 'COMPLETADO')
        //CAMBIAR EL ESTADO DE LA MESA A DISPONIBLE
        const order = await OrderModel.getOrderById(orderId)
        await TableModel.updateTableStatus(order.table_id, 'DISPONIBLE')
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

  static async cancelOrder(req, res) {
    const { orderId, tableId } = req.params

    try {
      const order = await OrderModel.getOrderById(orderId)
      if (!order) {
        const error = new Error('Orden no encontrada')
        return res.status(404).json({ message: error.message, status: false });
      }
      //VALIDAR SI LA MESA PERTENECE A LA ORDEN
      if (order.table_id !== tableId) {
        const error = new Error('La mesa no pertenece a la orden')
        return res.status(400).json({ error: error.message, status: false });
      }

      //VALIDAR SI LA MESA EXISTE
      const table = await TableModel.getTableById(tableId)
      if (!table) {
        const error = new Error('Mesa no encontrada')
        return res.status(404).json({ error: error.message, status: false });
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
        OrderModel.updateOrderStatus(orderId, 'CANCELADO'),
        //CAMBIAR EL ESTADO DE LA MESA A DISPONIBLE
        TableModel.updateTableStatus(tableId, 'Disponible')
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

}
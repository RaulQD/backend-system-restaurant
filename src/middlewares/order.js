import { body } from "express-validator";
import { OrderModel } from "../models/orders.js";


export const orderValidation = [
    body('quantity')
        .notEmpty().withMessage('Ingresa la cantidad del plato')
        .isInt({ min: 1 }).withMessage('La cantidad debe ser mayor a 0')
        .trim(),
    body('dish_id')
        .notEmpty().withMessage('Ingresa el id del plato')
        .isInt().withMessage('El id del plato debe ser un número')
        .trim(),
]

/*MIDDLEWARE PARA VALIDAR SI LA ORDEN EXISTE */
export const validateOrderExist = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const order = await OrderModel.getOrderById(orderId);
        if (!order) {
            const error = new Error('La orden no existe');
            return res.status(404).json({ message: error.message, status: false });
        }
        req.order = order;
        next();
    } catch (error) {
        return res.status(500).json({ error: 'Error interno del servidor', status: false });
    }
}

/*MIDDLEWARE PARA VALIDAR SI LA ORDEN ESTA ACTIVA EN UNA MESA */
export const validateOrderActiveForTable = async (req, res, next) => {
    try {
        const { tableId } = req.params
        const statusAllowed = ['CREADO', 'PENDIENTE', 'EN PROCESO', 'LISTO PARA SERVIR', 'SERVIDO', 'LISTO PARA PAGAR']
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
        req.order = order
        next()
    } catch (error) {
        return res.status(500).json({ message: "Error al validar la orden activa", status: false });

    }
}

export const checkAndUpdateOrderStatus = async (req, res, next) => {

}
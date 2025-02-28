import { body } from "express-validator";
import { TableModel } from "../models/table.js";

export const tableValidation = [
  body('num_table')
    .notEmpty().withMessage('El número de mesa es requerido')
    .isString().withMessage('La mesa debe ser una cadena de texto.')
    .isLength({ min: 3 }).withMessage('La mesa debe tener al menos 3 caracteres.')
    .trim(),
  body('capacity_table')
    .notEmpty().withMessage('La capacidad de la mesa es requerida')
    .isInt().withMessage('La capacidad de la mesa debe ser un número entero'),
  body('room_id')
    .notEmpty().withMessage('El id de la sala es requerido')
    .isInt().withMessage('El id de la sala debe ser un número entero')
]

export const validateTableExist = async (req, res, next) => {
  try {
    const { tableId } = req.params
    const table = await TableModel.getTableById(tableId)
    if (!table) {
      const error = new Error('La mesa no existe.')
      return res.status(404).json({ message: error.message, status: false })
    }
    req.table = table
    next()
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor', status: false })
  }
}
import { body } from "express-validator";

export const tableValidation = [
  body('num_table')
    .notEmpty().withMessage('El número de mesa es requerido')
    .isInt().withMessage('El número de mesa debe ser un número entero'),
  body('capacity_table')
    .notEmpty().withMessage('La capacidad de la mesa es requerida')
    .isInt().withMessage('La capacidad de la mesa debe ser un número entero'),
  body('room_name').notEmpty().withMessage('El nombre de la sala es requerido')
]
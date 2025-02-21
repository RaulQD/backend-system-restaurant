import { body } from "express-validator";


export const roomValidation = [
  body('room_name')
    .notEmpty().withMessage('El nombre de la sala es requerido')
    .isString().withMessage('El nombre debe ser una cadena de texto')
    .trim(),
  body('num_tables')
    .notEmpty().withMessage('El número de mesas es requerido')
    .isString({ min: 1 }).withMessage('La cantidad de mesas debe ser mayor a 0')
    .trim(),
    
]
import { body } from "express-validator";

export const dishValidation = [
  body('dishes_name')
    .notEmpty().withMessage('Ingresa el nombre del plato')
    .isString().withMessage('El nombre del plato debe tener solo letras')
    .isLength({ min: 4 }).withMessage('El nombre del plato debe tener al menos 4 caracteres'),
  body('dishes_description')
    .notEmpty().withMessage('Ingresa la descripción del plato.')
    .isLength({ min: 20 }).withMessage('La descripción del plato debe tener por lo menos 20 caracteres.'),
  body('price')
    .notEmpty().withMessage('Ingresa el precio del plato.')
    .isFloat({ gt: 0 }).withMessage('El precio no es válido. Debe ser un número positivo.'),
  body('category_name').notEmpty().withMessage('La categoria es requerida'),
]
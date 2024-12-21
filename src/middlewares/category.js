import { body } from 'express-validator';

export const categoryValidation = [
  body('category_name')
    .notEmpty().withMessage('El nombre de la categoria es requerido')
    .isString().withMessage('El nombre de la categoria debe ser letras')
    .trim(),
  body('category_description')
    .notEmpty().withMessage('La descripción de la categoria es requerida')
    .isString().withMessage('La descripción de la categoria debe ser letras')
    .isLength({ min: 20 }).withMessage('La descripción de la categoria debe tener al menos 20 caracteres').trim(),
]
import { body } from 'express-validator';
import { CategoryModel } from '../models/Category.js';

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

export const validateExistCategory = async (req, res, next) => {
  try {
    const { id } = req.params
    const category = await CategoryModel.getCategoryById(id);
    if (!category) {
      const error = new Error(`La categoria con el id ${id} no existe`);
      return res.status(404).json({ message: error.message, status: false });
    }
    req.category = category;
    next();
  } catch (error) {
    const statusCode = error.statusCode || 500
    return res.status(statusCode).json({
      message: error.message, // Mostrar mensaje de error
      status: false
    })
  }
}
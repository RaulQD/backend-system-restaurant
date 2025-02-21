import { body } from "express-validator";
import { DishesModel } from "../models/Dishes.js";

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


export const validateDishExist = async (req, res, next) => {
  try {
    const { dishId } = req.params
    const dish = await DishesModel.getDishById(dishId);
    if (!dish) {
      const error = new Error(`El plato con el id ${dishId} no existe.`)
      return res.status(404).json({ message: error.message, status: false })
    }
    req.dish = dish
    next()
  } catch (error) {
    const statusCode = error.statusCode || 500; // Si no hay statusCode, se usará 500
    return res.status(statusCode).json({
      message: error.message || 'Error interno del servidor',
      status: false // Mostrar que no se pudo realizar la operación
    });
  }
}
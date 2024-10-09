import { Router } from "express";

import { DishesController } from "../controllers/DishesController.js";
import { handleInputErrors } from "../middlewares/validation.js";
import { dishValidation } from "../middlewares/dish.js";
import { param } from "express-validator";
import { validatetoken } from "../middlewares/auth.js";


const routes = Router();


routes.get('/', DishesController.getDishes)
routes.post('/', dishValidation, handleInputErrors, DishesController.createDish)
routes.get('/:id',
  param('id').isUUID().withMessage('Invalid dishes id'),
  handleInputErrors,
  DishesController.getDishById)
routes.put('/:id',
  param('id').isUUID().withMessage('Invalid dishes id'),
  dishValidation,
  handleInputErrors,
  DishesController.updateDish)
routes.delete('/:id',
  param('id').isUUID().withMessage('Invalid dishes id'),
  handleInputErrors,
  DishesController.deleteDish)


export default routes;
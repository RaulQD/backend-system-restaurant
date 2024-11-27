import { Router } from "express";

import { DishesController } from "../controllers/DishesController.js";
import { handleInputErrors } from "../middlewares/validation.js";
import { dishValidation } from "../middlewares/dish.js";
import { param } from "express-validator";
import { upload } from "../helpers/multer.js";


const routes = Router();


routes.get('/', DishesController.getDishes)
routes.post('/', upload.single('image_url'), dishValidation, handleInputErrors, DishesController.createDish)
routes.get('/:dishId',
  param('dishId').isInt().withMessage('Invalid dishes id'),
  handleInputErrors,
  DishesController.getDishById)
routes.put('/:dishId', upload.single('image_url'),
  param('dishId').isInt().withMessage('Invalid dishes id'),
  handleInputErrors,
  DishesController.updateDish)
routes.delete('/:dishId',
  param('dishId').isInt().withMessage('Invalid dishes id'),
  handleInputErrors,
  DishesController.deleteDish)


export default routes;
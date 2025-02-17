import { Router } from "express";

import { DishesController } from "../controllers/DishesController.js";
import { handleInputErrors } from "../middlewares/validation.js";
import { dishValidation } from "../middlewares/dish.js";
import { param } from "express-validator";
import { upload } from "../helpers/multer.js";
import { authorizeRole, validateToken } from "../middlewares/auth.js";


const routes = Router();


routes.get('/', validateToken, authorizeRole(['administrador','mesero']), DishesController.getDishes)
routes.post('/', upload.single('image_url'), dishValidation, handleInputErrors, validateToken, authorizeRole(['administrador']), DishesController.createDish)
routes.get('/:dishId',
  param('dishId').isInt().withMessage('El id no es válido.'),
  handleInputErrors,
  validateToken, 
  authorizeRole(['administrador']),
  DishesController.getDishById)
routes.put('/:dishId', upload.single('image'),
  param('dishId').isInt().withMessage('El id no es válido.'),
  dishValidation,
  handleInputErrors,
  validateToken, 
  authorizeRole(['administrador']),
  DishesController.updateDish)
routes.patch('/:dishId/delete',
  param('dishId').isInt().withMessage('El id no es válido.'),
  handleInputErrors,
  validateToken, 
  authorizeRole(['administrador']),
  DishesController.deleteDish)
routes.patch('/:dishId/restore',
  param('dishId').isInt().withMessage('El id no es válido.'),
  validateToken, 
  authorizeRole(['administrador']),
  handleInputErrors,
  DishesController.restoredDish)

export default routes;
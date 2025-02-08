import { Router } from "express";
import { categoryValidation } from "../middlewares/category.js";
import { CategoryController } from "../controllers/CategoryController.js";
import { handleInputErrors } from "../middlewares/validation.js";
import { param } from "express-validator";
import { validateToken } from "../middlewares/auth.js";

const routes = Router();




routes.post('/',
  validateToken,
  categoryValidation,
  handleInputErrors, CategoryController.createCategory)
routes.get('/', validateToken,CategoryController.getCategories)
routes.get('/all', CategoryController.getCategoriesPagination)
routes.get('/:id',
  param('id').isInt().withMessage('Invalid category id'),
  validateToken,
  CategoryController.getCategoryById)
routes.put('/:id',
  param('id').isInt().withMessage('Invalid category id'),
  validateToken,
  categoryValidation,
  handleInputErrors, CategoryController.updateCategory)
routes.delete('/:id',
  param('id').isInt().withMessage('Invalid category id'),
  validateToken,
  handleInputErrors
  , CategoryController.deleteCategory)

export default routes;
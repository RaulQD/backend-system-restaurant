import { Router } from "express";
import { categoryValidation } from "../middlewares/category.js";
import { CategoryController } from "../controllers/CategoryController.js";
import { handleInputErrors } from "../middlewares/validation.js";
import { param } from "express-validator";

const routes = Router();


routes.post('/',
  categoryValidation,
  handleInputErrors, CategoryController.createCategory)
routes.get('/', CategoryController.getCategories)
routes.get('/all', CategoryController.getCategoriesPagination)
routes.get('/:id',
  param('id').isInt().withMessage('Invalid category id'),
  CategoryController.getCategoryById)
routes.put('/:id',
  param('id').isInt().withMessage('Invalid category id'),
  categoryValidation,
  handleInputErrors, CategoryController.updateCategory)
routes.delete('/:id',
  param('id').isInt().withMessage('Invalid category id'),
  handleInputErrors
  , CategoryController.deleteCategory)

export default routes;
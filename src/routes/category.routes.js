import { Router } from "express";
import { categoryValidation } from "../middlewares/category.js";
import { CategoryController } from "../controllers/CategoryController.js";
import { handleInputErrors } from "../middlewares/validation.js";
import { param } from "express-validator";
import { authorizeRole, validateToken } from "../middlewares/auth.js";

const routes = Router();




routes.post('/',
  validateToken,
  categoryValidation,
  authorizeRole(['administrador']),
  handleInputErrors, CategoryController.createCategory)
routes.get('/', validateToken, authorizeRole(['administrador']), CategoryController.getCategories)
routes.get('/all', validateToken, authorizeRole(['administrador']), CategoryController.getCategoriesPagination)
routes.get('/:id',
  param('id').isInt().withMessage('El id debe ser un número entero'),
  validateToken,
  authorizeRole(['administrador']),
  handleInputErrors,
  CategoryController.getCategoryById)
routes.put('/:id',
  param('id').isInt().withMessage('El id debe ser un número entero'),
  validateToken,
  authorizeRole(['administrador']),
  categoryValidation,
  handleInputErrors,
  CategoryController.updateCategory)
routes.delete('/:id',
  param('id').isInt().withMessage('El id debe ser un número entero'),
  validateToken,
  authorizeRole(['administrador']),
  handleInputErrors,
  CategoryController.deleteCategory)

export default routes;
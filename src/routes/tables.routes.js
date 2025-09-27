import { Router } from "express";
import { TableController } from "../controllers/TableController.js";
import { handleInputErrors } from "../middlewares/validation.js";
import { tableValidation, validateTableExist } from "../middlewares/table.js";
import { param, query } from "express-validator";
import { authorizeRole, validateToken } from "../middlewares/auth.js";


const routes = Router()

routes.get('/', validateToken, authorizeRole(['administrador', 'mesero']), TableController.getTables)
routes.post('/', validateToken, authorizeRole(['administrador']), tableValidation, handleInputErrors, TableController.createTable)
routes.get('/findTablesByRoom',
  query('room')
    .trim()
    .isString().withMessage('El nombre de la sala debe ser un string')
    .notEmpty().withMessage('El nombre de la sala es requerido'),
  validateToken, authorizeRole(['administrador', 'mesero']),
  TableController.getTablesByRoomName)

routes.patch('/:id/status', TableController)
routes.put('/:tableId',
  param('tableId')
    .isInt().withMessage('El id de la mesa debe ser un número entero'),
  tableValidation, validateToken, authorizeRole(['administrador', 'mesero']), validateTableExist, handleInputErrors, TableController.updateTable)
routes.get('/:tableId',
  param('tableId')
    .isInt().withMessage('El id de la mesa debe ser un número entero'),
  validateTableExist,
  validateToken, authorizeRole(['administrador','mesero']),
  handleInputErrors,
  TableController.getTableById)


export default routes;
import { Router } from "express";
import { TableController } from "../controllers/TableController.js";
import { handleInputErrors } from "../middlewares/validation.js";
import { tableValidation } from "../middlewares/table.js";
import { param, query } from "express-validator";


const routes = Router()

routes.get('/', TableController.getTables)
routes.post('/', tableValidation, handleInputErrors, TableController.createTable)
routes.get('/findTablesByRoom',
  query('room')
    .trim()
    .isString().withMessage('El nombre de la sala debe ser un string')
    .notEmpty().withMessage('El nombre de la sala es requerido'),
  TableController.getTablesByRoomName)

routes.patch('/:id/status', TableController)
routes.put('/:tableId',
  param('tableId')
    .isInt().withMessage('El id de la mesa debe ser un número entero'),
  tableValidation, handleInputErrors, TableController.updateTable)
routes.get('/:tableId',
  param('tableId')
    .isInt().withMessage('El id de la mesa debe ser un número entero'),
  handleInputErrors,
  TableController.getTableById)


export default routes;
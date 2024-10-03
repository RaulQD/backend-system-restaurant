import { Router } from "express";
import { TableController } from "../controllers/TableController.js";
import { handleInputErrors } from "../middlewares/validation.js";
import { tableValidation } from "../middlewares/table.js";


const routes = Router()

routes.get('/', TableController.getTables)
routes.post('/', tableValidation, handleInputErrors, TableController.createTable)
routes.get('/findTablesByRoom', TableController.getTablesByRoomName)

export default routes;
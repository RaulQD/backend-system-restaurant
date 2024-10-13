import { Router } from "express";
import { EmployeeController } from "../controllers/EmployeController.js";
import { handleInputErrors } from "../middlewares/validation.js";
import { validateQueryEmployee } from "../middlewares/employee.js";
import { param } from "express-validator";
import { upload } from "../helpers/cloudinary.js";



const routes = Router();



routes.get('/', validateQueryEmployee, handleInputErrors, EmployeeController.getEmployees);
routes.get('/:employeeId',
  param('employeeId').isUUID().withMessage('El id del empleado debe ser un UUID válido'),
  handleInputErrors,
  EmployeeController.getEmployeeById)
routes.put('/:employeId',
  param('employeeId').isUUID().withMessage('El id del empleado debe ser un UUID válido'),
  handleInputErrors,
  EmployeeController.updateEmployee)
routes.delete('/:employeeId',
  param('employeeId').isUUID().withMessage('El id del empleado debe ser un UUID válido'),
  handleInputErrors,
  EmployeeController.deleteEmployee)

export default routes;
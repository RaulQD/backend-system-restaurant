import { Router } from "express";
import { EmployeeController } from "../controllers/EmployeController.js";
import { handleInputErrors } from "../middlewares/validation.js";
import { validateEmployeeExist, validateQueryEmployee } from "../middlewares/employee.js";
import { param } from "express-validator";
import { upload } from "../helpers/multer.js";
import { authorizeRole, validateToken } from "../middlewares/auth.js";



const routes = Router();



routes.get('/', 
  validateQueryEmployee, 
  validateToken,
  authorizeRole(['administrador']), 
  handleInputErrors, 
  EmployeeController.getEmployees);
routes.get('/:employeeId',
  param('employeeId').isInt().withMessage('El id del empleado debe ser un id válido'),
  validateToken,
  authorizeRole(['administrador']), 
  validateEmployeeExist,
  handleInputErrors,
  EmployeeController.getEmployeeById)
routes.put('/:employeeId', upload.single('image'),
  param('employeeId').isInt().withMessage('El id del empleado debe ser un id válido'),
  validateToken,
  authorizeRole(['administrador']),
  validateEmployeeExist,
  handleInputErrors,
  EmployeeController.updateEmployee)
routes.patch('/:employeeId',
  param('employeeId').isInt().withMessage('El id del empleado debe ser un UUID válido'),
  validateToken,
  authorizeRole(['administrador']),
  validateEmployeeExist,
  handleInputErrors,
  EmployeeController.deleteEmployee)

export default routes;
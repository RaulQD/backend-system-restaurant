import { body, query } from "express-validator";
import { EmployeeModel } from "../models/employees.js";


export const validateQueryEmployee = [
  query('keyword')
    .optional()
    .isString().withMessage('El nombre debe ser un cadena de texto.')
    .not()
    .isNumeric().withMessage('El nombre no puede ser un número.'),
  query('status')
    .optional()
    .isString().withMessage('El estado debe ser un cadena de texto.')
    .not()
    .isNumeric().withMessage('El estado no puede ser un número.'),
]

export const employeeValidation = [
  body('names')
    .notEmpty().withMessage('Ingrese el nombre.')
    .isString().withMessage('El nombre debe ser una cadena de texto.')
    .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres.')
    .trim(),
  body('last_name')
    .notEmpty().withMessage('Ingrese el apellido completo.')
    .isString().withMessage('El apellido debe ser una cadena de texto.')
    .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres.')
    .trim(),
  body('dni')
    .notEmpty().withMessage('Ingrese el número de documento.')
    .isLength({ max: 8, min: 8 }).withMessage('El DNI debe tener 8 caracteres.')
    .isNumeric().withMessage('El número de documento debe tener números')
    .trim(),
  body('email')
    .notEmpty().withMessage('Ingrese el correo electrónico.')
    .isEmail().withMessage('El correo electrónico no es válido.')
    .trim(),
  body('phone')
    .matches(/^9\d*$/).withMessage('El número debe comenzar con 9')
    .notEmpty().withMessage('Ingrese el número de teléfono.')
    .isNumeric().withMessage('El número de teléfono debe ser un número.')
    .isLength({ max: 9, min: 9 }).withMessage('El número de teléfono debe tener 9 caracteres.')
    .trim(),
  body('address')
    .notEmpty().withMessage('Ingrese la dirección.')
    .isLength({ min: 3 }).withMessage('La dirección debe tener al menos 10 caracteres.')
    .trim(),
  body('salary')
    .notEmpty().withMessage('Ingrese el sueldo.')
    .isNumeric().withMessage('El sueldo debe ser un número.')
    .isLength({ min: 4 }).withMessage('El sueldo debe tener al menos 4 caracteres.')
    .trim(),
  body('hire_date')
    .notEmpty().withMessage('Ingrese la fecha de contratación.')
    .isDate().withMessage('La fecha de contratación no es válida.')
    .trim(),
]


export const validateEmployeeExist = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const employee = await EmployeeModel.getEmployeeById(employeeId)
    if (!employee) {
      const error = new Error(`El empleado con el id ${employeeId} no existe.`)
      return res.status(404).json({ message: error.message, status: false })
    }
    req.employee = employee;
    next();

  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Error interno del servidor', status: false })
  }
}
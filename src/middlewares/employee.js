import { body, query } from "express-validator";


export const validateQueryEmployee = [
  query('searchName').optional().isString().withMessage('El nombre debe ser un cadena de texto.').not().isNumeric().withMessage('El nombre no puede ser un número.'),
  query('searchLastName').optional().isString().withMessage('el apellido debe ser un cadema de texto.'),
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
]
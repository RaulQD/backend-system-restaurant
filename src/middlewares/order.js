import { body } from "express-validator";


const validateOrder = [
  body('employee_id')
      .isInt().withMessage('El employee_id debe ser un número entero.')
      .notEmpty().withMessage('El employee_id es obligatorio.'),
  body('table_id')
      .isInt().withMessage('El table_id debe ser un número entero.')
      .notEmpty().withMessage('El table_id es obligatorio.'),
  body('order_status')
      .isIn(['PENDIENTE', 'EN PROCESO', 'COMPLETADO', 'CANCELADO'])
      .withMessage('El estado de la orden debe ser uno de los siguientes: PENDIENTE, EN PROCESO, COMPLETADO, CANCELADO.'),
  body('total')
      .optional()
      .isDecimal().withMessage('El total debe ser un número decimal.'),
];
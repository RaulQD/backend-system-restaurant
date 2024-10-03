import { body } from "express-validator";


export const roomValidation = [
  body('room_name')
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string')
    .isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
  body('num_tables')
    .notEmpty().withMessage('The quantity of tables is required')
    .isNumeric().withMessage('Capacity must be a number')
]
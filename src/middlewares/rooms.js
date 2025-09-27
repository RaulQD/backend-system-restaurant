import { body } from "express-validator";
import { RoomsModel } from "../models/rooms.js";


export const roomValidation = [
  body('room_name')
    .notEmpty().withMessage('El nombre de la sala es requerido')
    .isString().withMessage('El nombre debe ser una cadena de texto')
    .trim(),
  body('num_tables')
    .trim()
    .notEmpty().withMessage('El número de mesas es requerido')
    .isNumeric().withMessage('Debe ser un número válido')
    .custom((value) => {
      const num = parseInt(value, 10)
      if (isNaN(num) || num < 1 || num > 100) {
        throw new Error('La cantidad de mesas debe estar entre 1 y 100')
      }
      return true
    })
    .toInt()

]

export const validateRoomExist = async (req, res, next) => {
  try {
    const { roomId } = req.params
    const room = await RoomsModel.getRoomById(roomId)
    if (!room) {
      const error = new Error('La sala no existe.')
      return res.status(404).json({ message: error.message, status: false })
    }
    req.room = room
    next()
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor', status: false })
  }
}
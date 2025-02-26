import { body } from "express-validator";
import { RoomsModel } from "../models/rooms.js";


export const roomValidation = [
  body('room_name')
    .notEmpty().withMessage('El nombre de la sala es requerido')
    .isString().withMessage('El nombre debe ser una cadena de texto')
    .trim(),
  body('num_tables')
    .notEmpty().withMessage('El número de mesas es requerido')
    .isString({ min: 1 }).withMessage('La cantidad de mesas debe ser mayor a 0')
    .trim(),

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
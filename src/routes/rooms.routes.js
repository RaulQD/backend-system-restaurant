import { Router } from "express";
import { RoomsController } from "../controllers/RoomsController.js";
import { handleInputErrors } from "../middlewares/validation.js";
import { roomValidation, validateRoomExist } from "../middlewares/rooms.js";
import { param } from "express-validator";
import { authorizeRole, validateToken } from "../middlewares/auth.js";


const routes = Router()

routes.get('/', validateToken, authorizeRole(['administrador', 'mesero']), RoomsController.getAllRooms)
routes.post('/', validateToken, authorizeRole(['administrador']), roomValidation, handleInputErrors, RoomsController.createRoom)
routes.get('/:roomId',
  param('roomId')
    .isInt()
    .withMessage('ID de sala inválido'),
  validateToken,
  authorizeRole(['administrador']),
  validateRoomExist,
  handleInputErrors,
  RoomsController.getRoomById)
routes.put('/:roomId',
  param('roomId')
    .isInt().withMessage('ID de sala inválido'),
  validateToken,
  authorizeRole(['administrador']),
  roomValidation,
  validateRoomExist,
  handleInputErrors,
  RoomsController.updateRoom)
routes.delete('/:roomId',
  param('roomId')
    .isInt()
    .withMessage('ID de sala inválido'),
  validateToken,
  authorizeRole(['administrador']),
  validateRoomExist,
  handleInputErrors,
  RoomsController.deleteRoom)


export default routes;
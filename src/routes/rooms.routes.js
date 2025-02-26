import { Router } from "express";
import { RoomsController } from "../controllers/RoomsController.js";
import { handleInputErrors } from "../middlewares/validation.js";
import { roomValidation, validateRoomExist } from "../middlewares/rooms.js";
import { param } from "express-validator";


const routes = Router()

routes.get('/', RoomsController.getAllRooms)
routes.post('/', roomValidation, handleInputErrors, RoomsController.createRoom)
routes.get('/:roomId',
  param('roomId')
    .isInt()
    .withMessage('ID de sala inválido'),
  validateRoomExist,
  handleInputErrors,
  RoomsController.getRoomById)
routes.put('/:roomId',
  param('roomId')
    .isInt().withMessage('ID de sala inválido'),
  roomValidation,
  validateRoomExist,
  handleInputErrors,
  RoomsController.updateRoom)
routes.delete('/:roomId',
  param('roomId')
    .isInt()
    .withMessage('ID de sala inválido'),
  validateRoomExist,
  handleInputErrors,
  RoomsController.deleteRoom)


export default routes;
import { RoomsModel } from "../models/rooms.js"


export class RoomsController {
  static async getAllRooms(req, res) {
    try {
      const rooms = await RoomsModel.getRooms()
      return res.status(200).json(rooms)
    } catch (error) {
      console.log(error)
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }
  static async getRoomById(req, res) {
    const { roomId } = req.params
    try {
      const room = await RoomsModel.getRoomById(roomId)
      return res.status(200).json(room)
    } catch (error) {
      console.log(error)
      return res.status(404).json({ message: error.message, status: false })
    }
  }

  static async createRoom(req, res) {
    const { room_name, num_tables } = req.body
    try {

      const existingRoom = await RoomsModel.findRoomByName(room_name)
      if (existingRoom) {
        const error = new Error('La sala ya existe')
        return res.status(400).json({ message: error.message, status: false })
      }
      await RoomsModel.createRoom({ room_name, num_tables })
      return res.status(201).json({ message: 'Sala creada exitosamente', status: true })
    } catch (error) {
      console.log(error)
      return res.status(400).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }

  static async updateRoom(req, res) {
    const { roomId } = req.params
    const { room_name, num_tables } = req.body
    try {
      const room = await RoomsModel.getRoomById(roomId)
      if (!room) {
        const error = new Error('La sala no existe')
        return res.status(404).json({ message: error.message, status: false })
      }
      //VALIDATE IF THE ROOM NAME ALREADY EXISTS
      if (room_name && room_name !== room.room_name) {
        const existingRoom = await RoomsModel.findRoomByName(room_name)
        if (existingRoom && existingRoom.id_room !== roomId) {
          const error = new Error('El nombre de la sala ya está en uso')
          return res.status(400).json({ message: error.message, status: false })
        }
      }
      const roomData = { room_name, num_tables }
      const updatedRoom = await RoomsModel.updateRoom(roomId, roomData)

      return res.status(200).json({ message: 'Sala actualizada exitosamente', status: true, data: updatedRoom })
    } catch (error) {
      console.log(error)
      return res.status(400).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }
  static async deleteRoom(req, res) {
    const { roomId } = req.params
    try {
      const room = await RoomsModel.getRoomById(roomId)
      if (!room) {
        const error = new Error('La sala no existe')
        return res.status(404).json({ message: error.message, status: false })
      }

      await RoomsModel.deleteRoom(roomId)
      return res.status(200).json({ message: 'Sala eliminada exitosamente', status: true })
    } catch (error) {
      console.log(error)
      return res.status(400).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }
}
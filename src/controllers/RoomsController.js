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
    const { id } = req.params
    try {
      const room = await RoomsModel.getRoomById(id)
      return res.status(200).json({ status: true, data: room })
    } catch (error) {
      console.log(error)
      return res.status(404).json({ message: error.message, status: false })
    }
  }

  static async createRoom(req, res) {
    try {
      const room = await RoomsModel.createRoom(req.body)
      const { insertId } = room
      const roomCreated = await RoomsModel.getRoomById(insertId)
      return res.status(201).json({ status: true, message: 'Sala creada exitosamente', data: roomCreated })
    } catch (error) {
      console.log(error)
      return res.status(400).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }

  static async updateRoom(req, res) {
    const { id } = req.params
    try {
      const updatedRoom = await RoomsModel.updateRoom(id, req.body); // Pasar el req.body directamente
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
    const { id } = req.params
    try {
      await RoomsModel.deleteRoom(id)
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
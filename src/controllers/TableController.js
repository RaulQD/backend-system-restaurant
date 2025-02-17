import { RoomsModel } from "../models/rooms.js";
import { TableModel } from "../models/table.js";

export class TableController {


  static async getTables(req, res) {
    const { room, page, limit } = req.query
    const limitNumber = Number(limit) || 10
    const pageNumber = Number(page) || 1

    try {
      const tables = await TableModel.getTables(room, pageNumber, limitNumber)
      return res.status(200).json(tables ||  [])
    } catch (error) {
      console.log(error)
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }
  static async getTableById(req, res) {
    const { tableId } = req.params
    try {
      const table = await TableModel.getTableById(tableId)
      if (!table) {
        const error = new Error('Mesa no encontrada')
        return res.status(404).json({ message: error.message, status: false })
      }
      return res.status(200).json(table)
    } catch (error) {
      console.log(error)
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }

  static async getTablesByRoomName(req, res) {
    const { room } = req.query
    try {
      const tables = await TableModel.getTablesByRoomName(room)
      if (tables.length === 0) {
        const error = new Error('No se encontraron mesas en la sala')
        return res.status(404).json({ message: error.message, status: false })
      }
      const tablesResponse = tables.map(table => {
        return {
          id_table: table.id_table,
          num_table: table.num_table,
          capacity_table: table.capacity_table,
          status: table.status,
        }
      })

      return res.status(200).json(tablesResponse)
    } catch (error) {
      console.log(error)
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }

  static async createTable(req, res) {
    const { num_table, capacity_table, room_id } = req.body
    try {
      //
      const numTableExisting = await TableModel.fingByTableNumber(num_table)
      if (numTableExisting) {
        const error = new Error('La mesa ya esta registrada.')
        return res.status(400).json({ message: error.message, status: false })
      }
      const room = await RoomsModel.getRoomById(room_id)
      if (!room) {
        const error = new Error('La sala no existe')
        return res.status(404).json({ message: error.message, status: false })
      }

      const data = { num_table, capacity_table, room_id }
      const tableCreated = await TableModel.createTable(data)

      const table = await TableModel.getTableById(tableCreated.insertId)

      return res.status(201).json({ message: 'Mesa creada exitosamente', status: true, data: table })
    } catch (error) {
      console.log(error)
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }

  static async updateTableStatus(req, res) {
    const { id } = req.params
    const { status } = req.body
    try {
      await TableModel.updateTableStatus(id, status)
      res.status(200).json({ message: 'Estado de la mesa actualizado', status: true })
    } catch (error) {
      console.log(error)
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }
  static async updateTable(req, res) {
    try {
      const { tableId } = req.params
      const { num_table, capacity_table, room_id } = req.body

      const existingTable = await TableModel.getTableById(tableId);
      if (!existingTable) {
        const error = new Error('Mesa no encontrada')
        return res.status(404).json({ message: error.message, status: false })
      }
      const room = await RoomsModel.getRoomById(room_id)
      if (!room) {
        const error = new Error('La sala no existe')
        return res.status(404).json({ message: error.message, status: false })
      }
      const data = { num_table, capacity_table, room_id }
      const updateRows = await TableModel.updateTable(tableId, data)
      if (updateRows === 0) {
        const error = new Error('No se pudo actualizar la mesa')
        return res.status(400).json({ message: error.message, status: false })
      }

      return res.status(200).json({ message: 'Mesa actualizada exitosamente', status: true })

    } catch (error) {
      console.log(error)
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }

}
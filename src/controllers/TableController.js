import { TableModel } from "../models/table.js";

export class TableController {


  static async getTables(req, res) {
    const { page = 1, limit = 10 } = req.query
    const limitNumber = Number(limit)
    const pageNumber = Number(page)
    const offset = (pageNumber - 1) * limitNumber

    try {
      const { result, countResult } = await TableModel.getTables(limitNumber, offset)
      return res.status(200).json({
        result,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          totalResults: result.length,
          totalPages: Math.ceil(countResult / limitNumber)
        }
      })
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
    const { id } = req.params
    try {
      const table = await TableModel.getTableById(id)
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
      return res.status(200).json(tables)
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
    try {
      // CREATE THE TABLE
      const table = await TableModel.createTable(req.body); // Pasar el req.body directamente
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

}
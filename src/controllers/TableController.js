import { TableModel } from "../models/table.js";

export class TableController {
  static async getTables(req, res) {
    const { page = 1, limit = 10 } = req.query
    const limitNumber = Number(limit)
    const pageNumber = Number(page)
    const offset = (pageNumber - 1) * limitNumber

    try {
      const { tables, countResult } = await TableModel.getTables(limitNumber, offset)
      return res.status(200).json({
        data: tables,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          totalResults: tables.length,
          totalPages: Math.ceil(countResult / limitNumber)
        }
      })
    } catch (error) {
      console.log(error)
      return res.status(400).json({
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
      return res.status(400).json({
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
      return res.status(400).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }
  static async updateTable(req, res) { }
}
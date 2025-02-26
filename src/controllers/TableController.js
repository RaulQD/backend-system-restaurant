import { RoomsModel } from "../models/rooms.js";
import { TableModel } from "../models/table.js";

export class TableController {


  static async getTables(req, res) {
    const { room, page, limit } = req.query
    const limitNumber = Number(limit) || 10
    const pageNumber = Number(page) || 1

    try {
      const tables = await TableModel.getTables(room, pageNumber, limitNumber)
      return res.status(200).json(tables || [])
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
    try {
      const table = req.table
      const tableResponse = {
        id_table: table.id_table,
        num_table: table.num_table,
        capacity_table: table.capacity_table,
        status: table.status,
        room: {
          id: table.id_room,
          room_name: table.room_name
        }
      }
      return res.status(200).json(tableResponse)
    } catch (error) {
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }

  static async getTablesByRoomName(req, res) {
    try {
      const { room } = req.query
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
          room: table.room_name,
          id_employee: table.id_employee,
          employee_name: table.employee_name,
          employee_last_name:table.employee_last_name,
          total_amount : table.total_amount
        }
      })

      return res.status(200).json(tablesResponse)
    } catch (error) {
      console.log(error)
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, 
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
      // Verificar si la sala existe
      const room = await RoomsModel.getRoomById(room_id);
      if (!room) {
        const error = new Error('La sala no existe.');
        return res.status(404).json({ message: error.message, status: false });
      }
      //VALIDAR QUE LA SALA NO TENGA MÁS MESAS DE LAS PERMITIDAS
      const tables = await TableModel.getTableByRoomId(room_id)
      if (tables.length >= room.num_tables) {
        const error = new Error('La sala ya tiene el número máximo de mesas permitidas.');
        return res.status(400).json({ message: error.message, status: false });
      }

      // Crear la mesa
      const tableCreated = await TableModel.createTable({ num_table, capacity_table }, room_id);
      // Obtener la mesa recién creada
      const table = await TableModel.getTableById(tableCreated.insertId);

      return res.status(201).json({ message: 'Mesa creada exitosamente', status: true, table })
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
      const { num_table, capacity_table, room_id } = req.body
      const table = req.table
     
      const room = await RoomsModel.getRoomById(room_id)
      if (!room) {
        const error = new Error('La sala no existe')
        return res.status(404).json({ message: error.message, status: false })
      }
      const data = { num_table, capacity_table, room_id }
      const updateRows = await TableModel.updateTable(table.id_table, data)
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
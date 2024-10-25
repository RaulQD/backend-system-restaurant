import { pool } from "../config/mysql.js";

export class TableModel {

  static async findTableById(id) {
    const [results] = await pool.query('SELECT * FROM tables WHERE id_table = ?', [id])
    return results[0]
  }

  static async getTables(limit, offset) {
    const [tablesResult] = await pool.query('SELECT id_table as id, num_table, capacity_table, r.id_room , r.room_name FROM tables t JOIN rooms r ON t.room_id = r.id_room ORDER BY num_table ASC LIMIT ? OFFSET ? ', [+limit, +offset])


    const [countResults] = await pool.query('SELECT COUNT(*) AS count FROM tables')

    //GET JSON ARRAY OF THE RESULTS
    const result = tablesResult.map(tables => {
      return {
        id: tables.id,
        num_tables: tables.num_table,
        capacity_table: tables.capacity_table,
        room: {
          id: tables.id_room,
          room_name: tables.room_name
        }
      }
    })
    return { result, countResult: countResults[0]?.count };
  }

  static async getTableById(id) {
    const [results] = await pool.query('SELECT id_table as id, num_table, capacity_table FROM tables WHERE id_table = ?', [id])
    const table = results[0]

    return table
  }

  static async getTablesByRoomName(room_name) {
    const [results] = await pool.query('SELECT id_table, t.num_table, t.capacity_table, r.room_name FROM tables t JOIN rooms r ON t.room_id = r.id_room WHERE r.room_name = ? ORDER BY t.num_table ASC;', [room_name])
    if (results.length === 0) {
      const error = new Error('No se encontraron mesas en la sala')
      error.statusCode = 404 // Not found
      throw error
    }
    // GET JSON ARRAY OF THE RESULTS
    const tables = results.map(table => {
      return {
        id_table: table.id_table,
        num_table: table.num_table,
        capacity_table: table.capacity_table,
      }
    })

    return tables
  }
  static async createTable(data) {
    const { room_name, num_table, capacity_table } = data
    // 1- GET THE UUID OF THE ROOM
    const [roomResult] = await pool.query('SELECT id_room as id FROM rooms WHERE room_name = ?', [room_name])
    if (roomResult.length === 0) {
      throw new Error('La sala no existe')
    }
    const [{ id }] = roomResult

    try {
      // 3- INSERT THE NEW TABLE
      const [result] = await pool.query(`INSERT INTO tables ( num_table, capacity_table, room_id) VALUES (?,?,?)`, [num_table, capacity_table, id])
      const tableId = result.insertId
      // 4- GET THE NEW TABLE
      const [results] = await pool.query('SELECT id_table as id, num_table, capacity_table FROM tables WHERE id_table = ?', [tableId])
      return results[0]
    } catch (error) {
      console.log(error)
      throw new Error('Error al crear la mesa')
    }
  }
  static async updateTable(id, data) { }

  static async updateTableStatus(id_table, status) {
    try {
      await pool.query('UPDATE tables SET status = ? WHERE id_table = ?', [status, id_table])
    } catch (error) {
      console.log(error)
      throw new Error('Error al actualizar el estado de la mesa')
    }

  }

}
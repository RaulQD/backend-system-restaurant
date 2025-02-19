import { pool } from "../config/mysql.js";

export class TableModel {

  static async findTableById(id) {
    const [results] = await pool.query('SELECT * FROM tables WHERE id_table = ?', [id])
    return results[0]
  }
  static async fingByTableNumber(num_table) {
    try {
      const [results] = await pool.query('SELECT id_table, num_table,capacity_table FROM tables WHERE num_table = ?', [num_table])
      return results[0]
    } catch (error) {
      console.log(error)
      throw new Error('Error al buscar la mesa')
    }
  }

  static async getTables(room, page = 1, limit = 10) {
    const offset = (page - 1) * limit

    let query = `SELECT t.id_table, t.num_table, t.capacity_table, r.id_room, r.room_name FROM tables t JOIN rooms r ON t.room_id = r.id_room WHERE 1=1 `
    let countQuery = `SELECT COUNT(*) AS count FROM tables t JOIN rooms r ON t.room_id = r.id_room WHERE 1=1`


    const queryParams = []
    const countParams = []

    if (room) {
      query += ` AND r.room_name = ?`
      countQuery += ` AND r.room_name = ?`
      queryParams.push(room)
      countParams.push(room)
    }
    
    query += ` ORDER BY id_table ASC`;

    query += ` LIMIT ? OFFSET ?`
    queryParams.push(limit, offset)

    const [countResults] = await pool.query(countQuery, countParams)
    const totalTables = countResults[0].count
    if (totalTables === 0) {
      if (room) {
        const error = new Error(`No se encontraron mesas en la sala ${room}.`)
        error.statusCode = 404
        throw error
      } else {
        const error = new Error(`No se encontraron mesas.`)
        error.statusCode = 404
        throw error
      }
    }
    const countQueryParams = [...queryParams]
    const [results] = await pool.query(query, countQueryParams)
    if (results.length === 0) {
      const error = new Error('No se encontraron mesas con los criterios de busquedas.')
      error.statusCode = 404
      throw error
    }
    const tables = results.map(table => {
      return {
        id_table: table.id_table,
        num_table: table.num_table,
        capacity_table: table.capacity_table,
        room: {
          id_room: table.id_room,
          room_name: table.room_name
        }
      }
    })

    return { results: tables, pagination: { page, limit, totalTables } };
  }

  static async getTableById(tableId) {
    try {
      const [results] = await pool.query('SELECT t.id_table, t.num_table, t.capacity_table, r.id_room, r.room_name FROM tables t JOIN rooms r ON t.room_id = r.id_room WHERE id_table = ?', [tableId])
      
      const table = results[0];
      return table
    } catch (error) {
      console.log(error)
      throw new Error('Error al obtener la mesa')
    }
  }

  static async getTablesByRoomName(room_name) {
    const [results] = await pool.query('SELECT id_table, t.num_table, t.capacity_table, t.status, r.room_name FROM tables t JOIN rooms r ON t.room_id = r.id_room WHERE r.room_name = ? ORDER BY t.num_table ASC;', [room_name])

    return results
  }
  //FUNCIÓN PARA OBTENER SI LA MESA ESTÁ OCUPADA O NO
  static async getTableStatus(id) {
    const [results] = await pool.query('SELECT status FROM tables WHERE id_table = ?', [id])
    return results[0].status
  }

  static async createTable(data, roomId) {
    const { num_table, capacity_table } = data

    try {
      // 3- INSERT THE NEW TABLE
      const [result] = await pool.query(`INSERT INTO tables ( num_table, capacity_table, room_id) VALUES (?,?,?)`, [num_table, capacity_table, roomId])
      console.log("Resultado de inserción:", result); // 👀 Verifica que insertId esté presente
      return result;
    } catch (error) {
      console.log(error)
      throw new Error('Error al crear la mesa')
    }
  }
  static async updateTable(tableId, data) {
    const { num_table, capacity_table, room_id } = data
    try {
      await pool.query('UPDATE tables SET num_table = ?, capacity_table = ?, room_id = ? WHERE id_table = ?', [num_table, capacity_table, room_id, tableId])
    } catch (error) {
      console.log(error)
      throw new Error('Error al actualizar la mesa')
    }
  }

  static async updateTableStatus(id, status) {
    try {
      await pool.query('UPDATE tables SET status = ? WHERE id_table = ?', [status, id])
    } catch (error) {
      console.log(error)
      throw new Error('Error al actualizar el estado de la mesa')
    }

  }

}
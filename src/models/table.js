import { pool } from "../config/mysql.js";

export class TableModel {
  static async getTables(limit, offset) {
    const [results] = await pool.query('SELECT BIN_TO_UUID(id_table) id, num_table, capacity_table, BIN_TO_UUID(r.id_room) id_room , r.room_name FROM tables t JOIN rooms r ON t.room_id = r.id_room ORDER BY num_table ASC LIMIT ? OFFSET ? ', [+limit, +offset])


    const [countResults] = await pool.query('SELECT COUNT(*) AS count FROM tables')

    //GET JSON ARRAY OF THE RESULTS
    const tables = results.map(tables => {
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
    return { tables, countResult: countResults[0]?.count, };
  }
  static async getTablesByRoomName(room_name) {
    const [results] = await pool.query('SELECT BIN_TO_UUID(t.id_table) as id_table, t.num_table, t.capacity_table, r.room_name FROM tables t JOIN rooms r ON t.room_id = r.id_room WHERE r.room_name = ? ORDER BY t.num_table ASC;', [room_name])
    // GET JSON ARRAY OF THE RESULTS
    const tables = results.map(table => {
      return {
        id_table: table.id_table,
        num_table: table.num_table,
        capacity_table: table.capacity_table,
      }
    })
    if(results.length === 0 ){
      throw new Error('No se encontraron mesas con ese nombre de sala')
    }
    return tables
  }
  static async createTable(data) {
    const { room_name, num_table, capacity_table } = data
    // 1- GET THE UUID OF THE ROOM
    const [roomResult] = await pool.query('SELECT BIN_TO_UUID(id_room) id FROM rooms WHERE room_name = ?', [room_name])
    if (roomResult.length === 0) {
      throw new Error('La sala no existe')
    }
    const [{ id }] = roomResult
    // 2- GET THE UUID 
    const [uuidResult] = await pool.query('SELECT UUID() uuid')
    const [{ uuid }] = uuidResult

    try {
      // 3- INSERT THE NEW TABLE
      await pool.query(`INSERT INTO tables (id_table, num_table, capacity_table, room_id) VALUES (UUID_TO_BIN("${uuid}"),?,?,UUID_TO_BIN(?))`, [num_table, capacity_table, id])
    } catch (error) {
      console.log(error)
      throw new Error('Error al crear la mesa')
    }
    // 4- GET THE NEW TABLE
    const [results] = await pool.query('SELECT BIN_TO_UUID(id_table) id, num_table, capacity_table FROM tables WHERE id_table = UUID_TO_BIN(?)', [uuid])

    return results[0]

  }
  static async updateTable(id, data) { }
}
import { pool } from "../config/mysql.js"


export class RoomsModel {

  static async getRooms() {
    const [results] = await pool.query('SELECT BIN_TO_UUID(id_room) id, room_name, num_tables FROM rooms')
    //GET JSON ARRAY OF THE RESULTS

    if (results.length === 0) {
      const error = new Error('No se encontraron salas')
      error.statusCode = 404 // Not found
      throw error
    }
    const rooms = results.map(room => {
      return {
        id: room.id,
        room_name: room.room_name,
        tables: room.num_tables
      }
    })
    return rooms
  }
  static async getRoomById(id) {
    const [results] = await pool.query('SELECT BIN_TO_UUID(id_room) id, room_name, num_tables FROM rooms WHERE id_room = UUID_TO_BIN(?)', [id])
    if (results.length === 0) {
      throw new Error('Sala no encontrada')
    }
    return results[0]
  }
  static async createRoom(data) {
    const { room_name, num_tables } = data

    //1- CHECK IF THE ROOM NAME ALREADY EXISTS
    const [existsRoom] = await pool.query('SELECT BIN_TO_UUID(id_room), room_name FROM rooms WHERE room_name = ?', [room_name])
    if (existsRoom.length > 0) {
      throw new Error('El nombre de la sala ya existe')
    }
    const [uuidResult] = await pool.query('SELECT UUID() uuid')
    const [{ uuid }] = uuidResult
    try {
      //2- INSERT THE NEW ROOM
      await pool.query(`INSERT INTO rooms (id_room, room_name, num_tables) VALUES (UUID_TO_BIN("${uuid}"),?, ?)`, [room_name, num_tables])

    } catch (error) {
      console.log(error)
      throw new Error('Error al crear la sala')
    }
    const [results] = await pool.query('SELECT BIN_TO_UUID(id_room) id, room_name, num_tables FROM rooms WHERE id_room = UUID_TO_BIN(?)', [uuid])

    return results[0]
  }
  static async updateRoom(id, data) {
    const { room_name, num_tables } = data
    // 1- CHECK IF THE ROOM EXISTS
    const [room] = await pool.query('SELECT * FROM rooms WHERE id_room = UUID_TO_BIN(?)', [id])
    if (room.length === 0) {
      throw new Error('Sala no encontrada')
    }
    // 2- CHECK IF THE ROOM NAME ALREADY EXISTS
    if (room_name) {
      const [existsRoom] = await pool.query('SELECT * FROM rooms WHERE room_name = ? AND id_room != UUID_TO_BIN(?)', [room_name, id])
      if (existsRoom.length > 0) {
        throw new Error('El nombre de la sala ya existe')
      }
    }
    try {
      // 3 - UPDATE THE ROOM
      await pool.query('UPDATE rooms SET room_name = ?, num_tables = ? WHERE id_room = UUID_TO_BIN(?)', [room_name, num_tables, id])
    } catch (error) {
      throw new Error('Error al actualizar la sala')
    }
    // 4- GET THE UPDATED ROOM
    const [results] = await pool.query('SELECT BIN_TO_UUID(id_room) id, room_name, num_tables FROM rooms WHERE id_room = UUID_TO_BIN(?)', [id])

    return results[0]
  }

  static async deleteRoom(id) {
    const [room] = await pool.query('SELECT * FROM rooms WHERE id_room = UUID_TO_BIN(?)', [id])
    if (room.length === 0) {
      throw new Error('Sala no encontrada')
    }
    try {
      await pool.query('DELETE FROM rooms WHERE id_room = UUID_TO_BIN(?)', [id])
    } catch (error) {
      throw new Error('Error al eliminar la sala')
    }

  }
}
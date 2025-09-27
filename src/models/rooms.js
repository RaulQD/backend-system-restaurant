import { pool } from "../config/mysql.js"


export class RoomsModel {

  static async getRooms() {
    try {
      const [results] = await pool.query('SELECT id_room as id, room_name, num_tables, status FROM rooms')
      return results
    } catch (error) {
      throw new Error('Error al buscar las salas')
    }
  }
  static async findRoomByName(room_name) {
    try {
      const [results] = await pool.query('SELECT id_room, room_name FROM rooms WHERE room_name = ?', [room_name])
      return results[0]
    } catch (error) {
      throw error;
    }
  }
  static async getRoomById(roomId) {
    try {
      const [results] = await pool.query('SELECT id_room, room_name, num_tables, status FROM rooms WHERE id_room = ?', [roomId])
      return results[0]
    } catch (error) {
      throw new error;
    }
  }
  static async createRoom(data) {
    try {
      const { room_name, num_tables } = data
      const [results] = await pool.query(`INSERT INTO rooms ( room_name, num_tables) VALUES (?, ?)`, [room_name, num_tables])
      return results
    } catch (error) {
      throw error;
    };
  }
  static async updateRoom(roomId, data) {
    const { room_name, num_tables } = data
    try {
      await pool.query('UPDATE rooms SET room_name = ?, num_tables = ? WHERE id_room = ?', [room_name, num_tables, roomId])
    } catch (error) {
      throw error;
    }
  }

  static async deleteRoom(roomId) {
    try {
      await pool.query('DELETE FROM rooms WHERE id_room = ?', [roomId])
    } catch (error) {
      throw error;
    }
  }
}
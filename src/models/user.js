import { pool } from "../config/mysql.js"
import { hashPassword } from "../utils/bcrypt.js"


export class UserModel {
  static async findByUsername(username) {
    const [existingUser] = await pool.query('SELECT * FROM users WHERE username = ?', [username])
    if (existingUser.length > 0) {
      throw new Error('El usuario ya existe')
    }
    return existingUser;
  }
  static async createUser(username, password, uuid) {
    const hashedPassword = await hashPassword(password)
    await pool.query(`INSERT INTO users (id_user, username, password) VALUES (UUID_TO_BIN(?), ?, ?)`, [uuid, username, hashedPassword]);
    return uuid; // Devuelve el id del usuario creado
  }
  static async findByUser(username) {
    const [user] = await pool.query('SELECT BIN_TO_UUID(u.id_user) as id, u.username, password, e.first_name, e.middle_name, e.last_name ,r.role_name FROM users u JOIN employees e ON e.user_id = u.id_user JOIN user_roles ur ON u.id_user = ur.user_id JOIN roles r ON ur.role_id = r.id_rol WHERE u.username = ?', [username])
    return user[0];
  }
  static async findByUserId(userId) {
    const [user] = await pool.query('SELECT BIN_TO_UUID(u.id_user) as id, u.username, e.first_name, e.middle_name, e.last_name ,r.role_name FROM users u JOIN employees e ON e.user_id = u.id_user JOIN user_roles ur ON u.id_user = ur.user_id JOIN roles r ON ur.role_id = r.id_rol WHERE u.id_user = UUID_TO_BIN(?)', [userId])
    return user[0];
  }

}
import { pool } from "../config/mysql.js"
import { checkCompare, hashPassword } from "../utils/bcrypt.js"


export class UserModel {
  static async findByUsername(username) {
    const [existingUser] = await pool.query('SELECT * FROM users WHERE username = ?', [username])
    if (existingUser.length > 0) {
      const error = new Error('El usuario ya existe')
      error.statusCode = 400;
      throw error;
    }
    return existingUser;
  }
  static async createUser(username, password) {
    const hashedPassword = await hashPassword(password)
    const [user] = await pool.query(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword]);
    return user; // Devuelve el id del usuario creado
  }
  static async findByUser(username) {
    const [user] = await pool.query('SELECT u.id_user as id, u.username, u.password, u.status, e.names, e.last_name, e.profile_picture_url ,r.role_name FROM users u JOIN employees e ON e.user_id = u.id_user JOIN user_roles ur ON u.id_user = ur.user_id JOIN roles r ON ur.role_id = r.id_rol WHERE u.username = ?', [username])
    if (user.length === 0) {
      const error = new Error('Usuario o contraseña incorrectos')
      error.statusCode = 400;
      throw error;
    }
    return user[0];
  }
  static async validatePassword(inputPassword, storedPassword) {
    const isValidPassword = await checkCompare(inputPassword, storedPassword);
    return isValidPassword;
  }

  static async findByUserId(userId) {
    const [user] = await pool.query('SELECT u.id_user as id, u.username, e.id_employee, e.names, e.last_name, e.profile_picture_url ,r.role_name FROM users u JOIN employees e ON e.user_id = u.id_user JOIN user_roles ur ON u.id_user = ur.user_id JOIN roles r ON ur.role_id = r.id_rol WHERE u.id_user = ?', [userId])
    if (!user || user.length === 0) { // Verificar si existe usuario
      throw new Error('Usuario no encontrado');
    }
    return user[0]; // Devolver el objeto usuario directamente
  }
  //ACTUALZAR LA CONTRASEÑA DEL USUARIO
  static async updatePassword(userId, password) {
    try {
      const [result] = await pool.query('UPDATE users SET password = ? WHERE id_user = ?', [password, userId])

      return result;
    } catch (error) {
      console.error('Error en updatePassword:', error.message);
      throw new Error(error.message || 'Error interno del servidor');
    }
  }
  static async updateUserStatus(userId, status) {
    try {
        const [result] = await pool.query('UPDATE users SET status = ? WHERE id_user = ?', [status, userId])
        return result;
    } catch (error) {
      console.error('Error en updatePassword:', error.message);
      throw new Error(error.message || 'Error interno del servidor');
    }
  }
}
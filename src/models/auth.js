import { pool } from "../config/mysql.js";
import { checkCompare } from "../utils/bcrypt.js";

export class AuthModel {

  static async login(username, password) {
    const [user] = await pool.query('SELECT username, password FROM users WHERE username = ?', [username]);
    if (user.length === 0) {
      throw new Error('Usuario o contraseña incorrectos');
    }
    const isValidPassword = await checkCompare(password, user[0].password);
    if (!isValidPassword) {
      throw new Error('Usuario o contraseña incorrectos');
    }
    return user[0];
  }
}
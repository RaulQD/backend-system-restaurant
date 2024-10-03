import { pool } from "../config/mysql.js";


export class RolModel {
  static async findByRolName(role_name) {
    const [roleResult] = await pool.query('SELECT id_rol FROM roles WHERE role_name = ?', [role_name]);
    if (roleResult.length === 0) {
      throw new Error('El rol especificado no existe');
    }
    return roleResult;
  }

  static async assignRoleToUser(uuid, id_rol) {
    await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (UUID_TO_BIN(?), ?)', [uuid, id_rol]);
  }
}
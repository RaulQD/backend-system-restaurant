import { pool } from "../config/mysql.js"

export class CategoryModel {
  static async findCategoryByName(category_name) {
    const [result] = await pool.query('SELECT id_category, category_name, category_description FROM category WHERE category_name = ?', [category_name])
    return result[0] || null;
  }
  static async getCategories() {
    const [results] = await pool.query('SELECT id_category as id, category_name, category_description FROM category')
    if (results.length === 0) {
      const error = new Error('No hay categorias registradas')
      error.status = 404
      throw error
    }
    return results
  }

  static async getCategoryById(id) {
    const [result] = await pool.query('SELECT id_category as id, category_name, category_description FROM category WHERE id_category = ?', [id])
    return result[0] || null
  }
  static async createCategory(category_name, category_description) {
    try {
      const [result] = await pool.query('INSERT INTO category (category_name, category_description) VALUES (?, ?)', [category_name, category_description])
      return result

    } catch (error) {
      return { message: 'Internal server error', status: false }
    }
  }

  static async updateCategory(data, id_category) {
    const { category_name, category_description } = data
    try {
      const [result] = await pool.query('UPDATE category SET category_name = ?, category_description = ? WHERE id_category = ?', [category_name, category_description, id_category])
      return result
    } catch (error) {
      console.log(error)
      throw new Error('Error al actualizar la categoria')
    }
  }
  static async deleteCategory(id_category) {
    try {
      await pool.query('DELETE FROM category WHERE id_category = ?', [id_category])
    } catch (error) {
      console.log(error)
      throw new Error('Error al eliminar la categoria')
    }
  }

}
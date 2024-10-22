import { pool } from "../config/mysql.js"

export class CategoryModel {
  static async findCategoryByName(category_name) {
    const [result] = await pool.query('SELECT BIN_TO_UUID(id_category) id, category_name, category_description FROM category WHERE category_name = ?', [category_name])
    const category = result[0]
    if (category.length === 0) {
      const error = new Error('la categoria no existe')
      error.status = 404
      throw error
    }
    return category
  }
  static async getCategories() {
    const [results] = await pool.query('SELECT BIN_TO_UUID(id_category) id, category_name, category_description FROM category')
    if (results.length === 0) {
      const error = new Error('No hay categorias registradas')
      error.status = 404
      throw error
    }
    return results
  }

  static async getCategoryById(uuid) {

    const [result] = await pool.query('SELECT BIN_TO_UUID(id_category) id, category_name, category_description FROM category WHERE id_category = UUID_TO_BIN(?)', [uuid])
    const category = result[0]
    if (category.length === 0) {
      const error = new Error('La categoria no existe')
      error.status = 404
      throw error
    }
    return category
  }
  static async updateCategory(data,uuid){
    const { category_name, category_description } = data
    const category = await this.getCategoryById(uuid)
    if(category_name){
      const existingCategory = await this.findCategoryByName(category_name)
      if (existingCategory.id !== category.id) {
        const error = new Error('La categoria ya existe')
        error.status = 400
        throw error
      }
    }
    await pool.query('UPDATE category SET category_name = ?, category_description = ? WHERE id_category = UUID_TO_BIN(?)', [category_name, category_description, uuid])
    
  }

  static async createCategory(category_name, category_description) {
    try {
      await pool.query('INSERT INTO category (category_name, category_description) VALUES (?, ?)', [category_name, category_description])

    } catch (error) {
      return { message: 'Internal server error', status: false }
    }
  }
}
import { pool } from "../config/mysql.js"
import { v4 as uuidv4 } from 'uuid';

export class CategoryController {

  static async createCategory(req, res) {
    try {
      const { category_name, category_description } = req.body
      const [uuidResult] = await pool.query('SELECT UUID() uuid')
      const [{ uuid }] = uuidResult
      // 1- CHECK IF THE CATEGORY ALREADY EXISTS
      const [existingCategory] = await pool.query('SELECT * FROM category WHERE category_name = ?', [category_name])
      if (existingCategory.length > 0) {
        const error = new Error('La categoria ya existe')
        return res.status(400).json({ message: error.message, status: false })
      }
      // 2 - CREATE A NEW CATEGORY
      await pool.query(`INSERT INTO category (id_category, category_name, category_description) VALUES ( UUID_TO_BIN("${uuid}"),?, ?)`, [category_name, category_description])

      // 3 - GET THE NEWLY CREATED CATEGORY
      const [dishes] = await pool.query('SELECT BIN_TO_UUID(id_category) id, category_name, category_description FROM category WHERE id_category = UUID_TO_BIN(?)', [uuid])
      console.log({
        message: 'Categoría creada exitosamente',
        data: dishes[0]
      })
      return res.status(201).json({
        message: 'Categoría creada exitosamente',
        status: true,
        data: dishes[0]
      });
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
  static async getCategories(req, res) {
    try {
      // 1 - GET VALUES FROM THE REQUEST QUERY PARAMETERS TO USE FOR FILTERING
      const { category_name, page = 1, limit = 10, keyword } = req.query
      // 2 - CONVERT THE LIMIT AND PAGE TO NUMBERS
      const limitNumber = Number(limit)
      const pageNumber = Number(page)
      // 3 - FILTER KEYWORD

      // 4 - USE THE VALUES TO FILTER THE CATEGORIES FROM THE DATABASE
      // 1 - GET ALL GATEGORIES FROM DATABASE
      const [categories] = await pool.query('SELECT BIN_TO_UUID(id_category) id, category_name, category_description FROM category')
      if (categories.length === 0) {
        const error = new Error('No hay ninguna categoria en la base de datos')
        return res.status(404).json({ message: error.message, status: false })
      }
      // 2 - RETURN THE CATEGORIES
      return res.status(200).json({ message: 'Categorias obtenidas exitosamente', status: true, data: categories })
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  static async getCategoryById(req, res) {
    try {
      const { id } = req.params
      const [category] = await pool.query('SELECT BIN_TO_UUID(id_category) id, category_name, category_description FROM category WHERE id_category = UUID_TO_BIN(?)', [id])
      if (category.length === 0) {
        const error = new Error('La categoria no existe')
        return res.status(404).json({ message: error.message, status: false })
      }
      return res.status(200).json({ message: 'Categoria obtenida exitosamente', status: true, data: category[0] })
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
  static async updateCategory(req, res) {
    try {
      const { id } = req.params
      const { category_name, category_description } = req.body
      const [category] = await pool.query('SELECT BIN_TO_UUID(id_category) id, category_name, category_description FROM category WHERE id_category = UUID_TO_BIN(?)', [id])
      if (category.length === 0) {
        const error = new Error('La categoria no existe')
        return res.status(404).json({ message: error.message, status: false })
      }
      if(category_name){
        const [existingCategory] = await pool.query('SELECT * FROM category WHERE category_name = ? AND id_category != UUID_TO_BIN(?)', [category_name, id])
        if (existingCategory.length > 0) {
          const error = new Error('La categoria ya existe')
          return res.status(400).json({ message: error.message, status: false })
        }
      }

      await pool.query('UPDATE category SET category_name = ?, category_description = ? WHERE id_category = UUID_TO_BIN(?)', [category_name, category_description, id])

      return res.status(200).json({ message: 'Category updated successfully', status: true, data: { id, category_name, category_description } })
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' })
    }
  }
  static async deleteCategory(req, res) {
    try {
      const { id } = req.params
      const [category] = await pool.query('SELECT BIN_TO_UUID(id_category) id, category_name, category_description FROM category WHERE id_category = UUID_TO_BIN(?)', [id])
      if (category.length === 0) {
        const error = new Error(`La categoria con el id ${id} no existe`)
        return res.status(404).json({ message: error.message, status: false })
      }
      await pool.query('DELETE FROM category WHERE id_category = UUID_TO_BIN(?)', [id])
      return res.status(200).json({ message: 'Category deleted successfully' })
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
}

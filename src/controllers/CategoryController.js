import { pool } from "../config/mysql.js"
import { CategoryModel } from "../models/Category.js";

export class CategoryController {

  static async createCategory(req, res) {
    try {
      const { category_name, category_description } = req.body

      // 1- CHECK IF THE CATEGORY ALREADY EXISTS
      const [existingCategory] = await pool.query('SELECT * FROM category WHERE category_name = ?', [category_name])
      if (existingCategory.length > 0) {
        const error = new Error('La categoria ya existe')
        return res.status(400).json({ message: error.message, status: false })
      }
      // 2 - CREATE A NEW CATEGORY
      const [category] = await pool.query(`INSERT INTO category (category_name, category_description) VALUES (?, ?)`, [category_name, category_description])
      const categoryId = category.insertId

      // 3 - GET THE NEWLY CREATED CATEGORY
      const [dishes] = await pool.query('SELECT id_category as id, category_name, category_description FROM category WHERE id_category = ?', [categoryId])

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
      const categories = await CategoryModel.getCategories()
      // 2 - RETURN THE CATEGORIES
      return res.status(200).json(categories)
    } catch (error) {
      console.log(error)
      const statusCode = error.statusCode || 500; // Si no hay statusCode, se usará 500
      return res.status(statusCode).json({
        message: error.message || 'Error interno del servidor',
        status: false // Mostrar que no se pudo realizar la operación
      });
    }
  }

  static async getCategoryById(req, res) {
    try {
      const { id } = req.params
      const category = await CategoryModel.getCategoryById(id)
      if (!category) {
        const error = new Error('Categoria no encontrada')
        return res.status(404).json({ message: error.message, status: false })
      }
      return res.status(200).json(category)
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
  static async updateCategory(req, res) {
    try {
      const { id } = req.params
      const { category_name, category_description } = req.body
      const existingCategory = await CategoryModel.getCategoryById(id)
      if (!existingCategory) {
        const error = new Error(`La categoria con el id ${id} no existe`)
        return res.status(404).json({ message: error.message, status: false })
      }
      if (category_name && dishes_name !== existingCategory.category_name) {
        const existingCategoryName = await CategoryModel.findCategoryByName(category_name.trim())
        if (existingCategoryName && existingCategoryName.id !== existingCategory.id) {
          const error = new Error('El nombre de la categoria ya esta en uso')
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

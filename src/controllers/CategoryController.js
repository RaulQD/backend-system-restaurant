import { pool } from "../config/mysql.js"
import { CategoryModel } from "../models/Category.js";

export class CategoryController {

  static async createCategory(req, res) {
    try {
      const { category_name, category_description } = req.body

      // 1- CHECK IF THE CATEGORY ALREADY EXISTS
      const existingCategory = await CategoryModel.findCategoryByName(category_name)
      if (existingCategory) {
        const error = new Error(`La categoria ${category_name} ya existe`)
        return res.status(400).json({ message: error.message, status: false })
      }
      // 2 - CREATE A NEW CATEGORY
      const result = await CategoryModel.createCategory(category_name, category_description)
      const categoryId = result.insertId

      // 3 - GET THE NEWLY CREATED CATEGORY
      const category = await CategoryModel.getCategoryById(categoryId)

      return res.status(201).json({
        message: 'Categoría creada exitosamente',
        status: true,
        data: category
      });
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
  static async getCategories(req, res) {
    // 1 - GET VALUES FROM THE REQUEST QUERY PARAMETERS TO USE FOR FILTERING
    const { page = 1, limit = 10, keyword = '' } = req.query
    // 2 - CONVERT THE LIMIT AND PAGE TO NUMBERS
    const pageNumber = Number(page) || 1
    const limitNumber = Number(limit) || 10 
    try {
      // 1 - GET ALL GATEGORIES FROM DATABASE
      const categories = await CategoryModel.getCategories(limitNumber, pageNumber, keyword)
      // 2 - RETURN THE CATEGORIES
      return res.status(200).json(categories || [])
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

      //VERIFICAR SI LA CATEGORIA EXISTE
      const existingCategory = await CategoryModel.getCategoryById(id)
      if (!existingCategory) {
        const error = new Error(`La categoria con el id ${id} no existe`)
        return res.status(404).json({ message: error.message, status: false })
      }
      //VERIFICAR SI EL NOMBRE DE LA CATEGORIA YA EXISTE EN LA BASE DE DATOS SI NO ACTUALIZAR CON EL MISMO NOMBRE
      if (category_name !== existingCategory.category_name) {
        const categoryExists = await CategoryModel.findCategoryByName(category_name)
        if (categoryExists) {
          const error = new Error(`La categoria ${category_name} ya existe`)
          return res.status(400).json({ message: error.message, status: false })
        }
      }
      const data = { category_name, category_description }
      //ACTUALIZAR LA CATEGORIA
      const updateCategory = await CategoryModel.updateCategory(data, id)
      if (updateCategory.affectedRows === 0) {
        return res.status(500).json({ message: 'No se pudo actualizar la categoría', status: false });
      }


      return res.status(200).json({ message: 'Categoria actualizada correctamente', status: true, updateCategory })
    } catch (error) {
      console.log(error)
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      })
    }
  }
  static async deleteCategory(req, res) {
    try {
      const { id } = req.params
      const existingCategory = await CategoryModel.getCategoryById(id)
      if (!existingCategory) {
        const error = new Error(`La categoria con el id ${id} no existe`)
        return res.status(404).json({ message: error.message, status: false })
      }
      await CategoryModel.deleteCategory(id);
      return res.status(200).json({ message: 'La categoria se elimino correctamente.' })
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

}

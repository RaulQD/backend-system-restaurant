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
        return res.status(409).json({ message: error.message, status: false })
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
    try {
      const categories = await CategoryModel.getCategories()
      if (!categories.length) {
        return res.status(404).json({ message: 'No hay categorias registradas', status: false })
      }
      return res.status(200).json(categories)
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
  static async getCategoriesPagination(req, res) {
    // 1 - OBTENER LOS VALORES DE LA QUERY PARA USAR PARA FILTRAR 
    const { keyword = '', page = 1, limit = 10 } = req.query
    // 2 - CONVERTIR LOS VALORES DE LA QUERY LIMIT Y PAGE A NUMEROS
    const limitNumber = Number(limit) || 10
    const pageNumber = Number(page) || 1
    try {
      // 1 - GET ALL GATEGORIES FROM DATABASE
      const categoriesData = await CategoryModel.getCategoriesPaginations(keyword, pageNumber, limitNumber)
      // 2 - RETURN THE CATEGORIES
      return res.status(200).json(categoriesData || [])
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
      const category = req.category
      return res.status(200).json(category)
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
  static async updateCategory(req, res) {
    try {
      const { category_name, category_description } = req.body
      const category = req.category

      //VERIFICAR SI EL NOMBRE DE LA CATEGORIA YA EXISTE EN LA BASE DE DATOS SI NO ACTUALIZAR CON EL MISMO NOMBRE
      if (category_name !== category.category_name) {
        const categoryExists = await CategoryModel.findCategoryByName(category_name)
        if (categoryExists) {
          const error = new Error(`La categoria ${category_name} ya existe`)
          return res.status(400).json({ message: error.message, status: false })
        }
      }
      const data = { category_name, category_description }
      //ACTUALIZAR LA CATEGORIA
      const updateCategory = await CategoryModel.updateCategory(data, category.id)
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
      const category = req.category
      await CategoryModel.deleteCategory(category.id);
      return res.status(200).json({ message: 'La categoria se elimino correctamente.' })
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

}

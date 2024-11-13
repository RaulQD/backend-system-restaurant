import { cloudinary } from "../config/cloudinary.config.js"
import { DishesModel } from "../models/Dishes.js"

export class DishesController {
  static async getDishes(req, res) {
    const { keyword = '', category = '', page, limit } = req.query
    const limitNumber = Number(limit) || 10
    const pageNumber = Number(page) || 1

    try {
      const dishesData = await DishesModel.getDishes(keyword, category, pageNumber, limitNumber)
      return res.status(200).json(dishesData || [])
    } catch (error) {
      console.log(error)
      const statusCode = error.statusCode || 500; // Si no hay statusCode, se usará 500
      return res.status(statusCode).json({
        message: error.message || 'Error interno del servidor',
        status: false // Mostrar que no se pudo realizar la operación
      });
    }
  }
  static async getDishById(req, res) {
    const { id } = req.params
    try {
      const dish = await DishesModel.getDishById(id);
      if (!dish) {
        return res.status(404).json({ message: 'Plato no encontrado', status: false })
      }
      return res.status(200).json(dish)
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  static async createDish(req, res) {
    try {

      const { dishes_name, dishes_description, price, available, category_name } = req.body

      // Validación manual de la imagen
      if (!req.file) {
        return res.status(400).json({ error: 'La imagen del plato es requerida.' });
      }
      const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
        folder: 'dishes'
      })
      const image_url = result.secure_url;
      const dishesData = { dishes_name, dishes_description, price, available, image_url, category_name }
      // CREATE THE DISH
      const dish = await DishesModel.createdish(dishesData); // Pasar el req.body directamente

      return res.status(201).json({ message: 'Plato creado exitosamente', status: true, dish })
    } catch (error) {
      console.log(error)
      return res.status(400).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }

  static async updateDish(req, res) {
    const { id } = req.params
    try {
      // UPDATE THE DISH
      const updatedDish = await DishesModel.updateDish(id, req.body); // Pasar el req.body directamente
      return res.status(200).json({ message: 'Plato actualizado exitosamente', status: true, data: updatedDish })
    } catch (error) {
      console.log(error)
      return res.status(400).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }
  static async deleteDish(req, res) {
    const { id } = req.params
    try {
      // DELETE THE DISH FROM THE DATABASE
      await DishesModel.deleteDish(id);

      return res.status(200).json({ message: 'Plato eliminado exitosamente', status: true })

    } catch (error) {
      console.log(error)
      return res.status(400).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }

}
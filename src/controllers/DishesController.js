import { DishesModel } from "../models/Dishes.js"

export class DishesController {
  static async getDishes(req, res) {
    const { search = '', category = '', page = 1, limit = 10 } = req.query
    const limitNumber = Number(limit)
    const pageNumber = Number(page)
    const offset = (pageNumber - 1) * limitNumber
    try {
      const { dishes, countResult } = await DishesModel.getDishes(search, category, limitNumber, offset)

      res.status(200).json({
        status: true,
        data: dishes,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          totalResults: dishes.length, // Total de platos sin paginación
          totalPages: Math.ceil(countResult / limitNumber), // Calcular total de páginas
        }
      });
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
  static async getDishById(req, res) {
    const { id } = req.params
    try {
      const dish = await DishesModel.getDishById(id);
      return res.status(200).json({ status: true, data: dish })
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  static async createDish(req, res) {
    try {
      // CREATE THE DISH
      const dish = await DishesModel.createdish(req.body); // Pasar el req.body directamente
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
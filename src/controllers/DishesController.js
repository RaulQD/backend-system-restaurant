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
      const statusCode = error.statusCode || 500; // Si no hay statusCode, se usará 500
      return res.status(statusCode).json({
        message: error.message || 'Error interno del servidor',
        status: false // Mostrar que no se pudo realizar la operación
      });
    }
  }
  static async getDishById(req, res) {
    try {
      const dish = req.dish
      const response = {
        id_dish: dish.id,
        dishes_name: dish.dishes_name,
        dishes_description: dish.dishes_description,
        price: dish.price,
        available: dish.available,
        image_url: dish.image_url,
        category_name: dish.category_name,
      }
      return res.status(200).json(response)
    } catch (error) {
      const statusCode = error.statusCode || 500; // Si no hay statusCode, se usará 500
      return res.status(statusCode).json({
        message: error.message || 'Error interno del servidor',
        status: false // Mostrar que no se pudo realizar la operación
      });
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

      const dish = await DishesModel.createdish(dishesData);

      return res.status(201).json({ message: 'Plato creado exitosamente', status: true, dish })
    } catch (error) {
      return res.status(400).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }

  static async updateDish(req, res) {
    try {
      const { dishes_name, dishes_description, price, available, category_name } = req.body
      const dish = req.dish

      if (dishes_name !== dish.dishes_name) {
        const existingDishName = await DishesModel.findDishByName(dishes_name.trim());
        if (existingDishName && existingDishName.id_dish !== dish.id) {
          const error = new Error('El nombre del plato ya está en uso');
          return res.status(400).json({ message: error.message, status: false });
        }
      }
      let image_url = dish.image_url;
      // Validación manual de la imagen
      if (req.file) {
        //ELIMNAR LA IMAGEN ANTERIOR en cloudinary
        if (dish.image_url) {
          const public_id = dish.image_url.split('/').pop();
          console.log('Eliminando imagen anterior', public_id);
          const destroyResponse = await cloudinary.uploader.destroy(`dishes/${public_id}`);
          if (destroyResponse.result === 'ok') {
            const error = new Error('Error al eliminar la imagen anterior');
            return res.status(400).json({ message: error.message, status: false });
          }

        }
        //SUBIR LA NUEVA IMAGEN
        const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
          folder: 'dishes'
        })
        //ACTUALIZAR LA URL DE LA IMAGEN
        image_url = result.secure_url;
        console.log('Nueva imagen', image_url)
      }
      // OBJETO DEL PLATO
      const updateDish = {
        dishes_name,
        dishes_description,
        price,
        available,
        image_url,
        category_name
      }
      // ACTUALIZAR EL PLATO
      const updatedDish = await DishesModel.updateDish(dish.id, updateDish);
      return res.status(200).json({ message: 'Plato actualizado exitosamente', status: true, updatedDish })
    } catch (error) {
      console.log(error)
      return res.status(400).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }
  static async deleteDish(req, res) {
    try {
      const dish = req.dish
      if (dish.available === 'NO DISPONIBLE') {
        const error = new Error('El plato ya está eliminado')
        return res.status(400).json({ message: error.message, status: false })
      }
      // DELETE THE DISH FROM THE DATABASE
      await DishesModel.deleteDish(dish.id);
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
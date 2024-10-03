import { pool } from "../config/mysql.js";

export class DishesModel {
  static async getDishes(search, category, limitNumber, offset) {


    const [results] = await pool.query(`SELECT BIN_TO_UUID(id_dish) id, dishes_name, dishes_description, price, available, BIN_TO_UUID(c.id_category) AS id_category, c.category_name, c.category_description FROM dishes d JOIN category c ON d.category_id = c.id_category WHERE (d.dishes_name LIKE CONCAT('%', ?, '%') OR ? = '') AND (c.category_name LIKE CONCAT('%', ?, '%') OR ? = '') LIMIT ? OFFSET ?`, [search, search, category, category, limitNumber, offset])

    // Consulta para obtener el número total de platos sin paginación
    const [countResults] = await pool.query('SELECT COUNT(*) AS count FROM dishes')

    //GET JSON ARRAY OF THE RESULTS
    const dishes = results.map(dish => {
      return {
        id: dish.id,
        dishes_name: dish.dishes_name,
        dishes_description: dish.dishes_description,
        price: dish.price,
        available: dish.available,
        category: {
          id: dish.id_category,
          category_name: dish.category_name,
          category_description: dish.category_description,
        }
      }
    })
    return {
      dishes,
      countResult: countResults[0]?.count,
    };
  }
  static async getDishById(id) {
    const [results] = await pool.query('SELECT BIN_TO_UUID(id_dish) id, dishes_name, dishes_description, price, available, BIN_TO_UUID(c.id_category) AS id_category, c.category_name, c.category_description FROM dishes d JOIN category c ON d.category_id = c.id_category WHERE id_dish = UUID_TO_BIN(?)', [id])
    if (results.length === 0) {
      return res.status(404).json({ message: 'Plato no encontrado', status: false })
    }
    const dishData = results[0];
    const response = {
      id: dishData.id_dish,
      dishes_name: dishData.dishes_name,
      dishes_description: dishData.dishes_description,
      price: dishData.price,
      available: dishData.available,
      category: {
        id: dishData.id_category,
        category_name: dishData.category_name,
        category_description: dishData.category_description,
      }
    };
    return response;
  }
  static async createdish(input) {
    const { dishes_name, dishes_description, price, category_name } = input
    // 1- GET THE UUID OF THE CATEGORY
    const [categoryResult] = await pool.query('SELECT BIN_TO_UUID(id_category) id FROM category WHERE category_name = ?', [category_name])
    if (categoryResult.length === 0) {
      throw new Error('La categoria no existe')
    }
    const [{ id }] = categoryResult
    // 2- GET THE UUID OF THE DISH
    const [uuidResult] = await pool.query('SELECT UUID() uuid')
    const [{ uuid }] = uuidResult
    // 3- CHECK IF THE DISH ALREADY EXISTS
    const [existingDish] = await pool.query('SELECT * FROM dishes WHERE dishes_name = ?', [dishes_name])
    if (existingDish.length > 0) {
      throw new Error('El plato ya existe')
    }
    try {
      // 4 - CREATE A NEW DISH
      await pool.query(`INSERT INTO dishes (id_dish, dishes_name, dishes_description, price, category_id) VALUES (UUID_TO_BIN("${uuid}"),?,?,?,UUID_TO_BIN(?))`, [dishes_name, dishes_description, price, id])
    } catch (error) {
      throw new Error('Error al crear el plato')
    }
    const [dishes] = await pool.query('SELECT BIN_TO_UUID(id_dish) id, dishes_name, dishes_description, price FROM dishes WHERE id_dish = UUID_TO_BIN(?)', [uuid])

    return dishes[0]
  }
  static async updateDish(id, input) {
    const { dishes_name, dishes_description, price, category_name } = input
    // 1- CHECK IF THE DISH EXISTS
    const [dishResult] = await pool.query('SELECT BIN_TO_UUID(id_dish) id FROM dishes WHERE id_dish = UUID_TO_BIN(?)', [id])
    if (dishResult.length === 0) {
      throw new Error('Plato no encontrado')
    }
    // 2- GET THE UUID OF THE CATEGORY
    const [categoryResult] = await pool.query('SELECT BIN_TO_UUID(id_category) id FROM category WHERE category_name = ?', [category_name])
    if (categoryResult.length === 0) {
      throw new Error('La categoria no existe')
    }
    const [{ id_category }] = categoryResult
    // 3 - CHECK IF THE DISH ALREADY EXISTS
    if (dishes_name) {
      const [existingDish] = await pool.query('SELECT * FROM dishes WHERE dishes_name = ? AND id_dish != UUID_TO_BIN(?)', [dishes_name, id])
      if (existingDish.length > 0) {
        throw new Error('Este plato ya existe')
      }
    }
    try {
      // 3 - UPDATE THE DISH
      const [result] = await pool.query('UPDATE dishes SET dishes_name = ?, dishes_description = ?, price = ?, category_id = UUID_TO_BIN(?) WHERE id_dish = UUID_TO_BIN(?)', [dishes_name, dishes_description, price, id_category, id])
      if (result.affectedRows === 0) {
        throw new Error('Error al actualizar el plato')
      }
    } catch (error) {
      throw new Error('Error al actualizar el plato')
    }
    // 4 - GET THE UPDATED DISH
    const [updatedDish] = await pool.query('SELECT BIN_TO_UUID(id_dish) id, dishes_name, dishes_description, price FROM dishes WHERE id_dish = UUID_TO_BIN(?)', [id])

    return updatedDish[0]
  }

  static async deleteDish(id) {
    // 1- CHECK IF THE DISH EXISTS
    const [dishResult] = await pool.query('SELECT BIN_TO_UUID(id_dish) id FROM dishes WHERE id_dish = UUID_TO_BIN(?)', [id])
    if (dishResult.length === 0) {
      throw new Error('Plato no encontrado')
    }
    try {
      await pool.query('DELETE FROM dishes WHERE id_dish = UUID_TO_BIN(?)', [id])
    } catch (error) {
      throw new Error('Error al eliminar el plato')
    }
  }
}
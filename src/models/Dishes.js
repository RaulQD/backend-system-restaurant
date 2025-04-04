import { pool } from "../config/mysql.js";

export class DishesModel {

  static async findDishByName(dishes_name) {
    const [results] = await pool.query('SELECT id_dish, dishes_name FROM dishes WHERE dishes_name = ?', [dishes_name])
    return results[0]
  }

  static async getDishes(keyword, category, page = 1, limit = 10) {
    let offset = (page - 1) * limit;

    // Consulta para obtener los platos
    let query = `SELECT id_dish, dishes_name, dishes_description, price, image_url, available, c.id_category AS id_category, c.category_name, c.category_description FROM dishes d JOIN category c ON d.category_id = c.id_category WHERE 1=1`

    // Consulta para contar el número total de platos
    let countQuery = `SELECT COUNT(*) as total FROM dishes d JOIN category c ON d.category_id = c.id_category WHERE 1=1`
    const queryParams = []

    // Agregar la búsqueda a la consulta
    if (keyword) {
      query += ` AND LOWER(d.dishes_name) LIKE LOWER(CONCAT('%', ?, '%'))`
      countQuery += ` AND LOWER(d.dishes_name) LIKE LOWER(CONCAT('%', ?, '%'))`
      queryParams.push(keyword)
    }
    // Agregar la categoría a la consulta
    if (category) {
      query += ` AND c.category_name = ?`
      countQuery += ` AND c.category_name = ?`
      queryParams.push(category)
    }
    // Agregar ORDER BY antes de la paginación
    query += ` ORDER BY id_dish ASC`;

    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    // Ejecutar la consulta de conteo para obtener el total de empleados
    const [countResults] = await pool.query(countQuery, queryParams)
    const totalDishes = countResults[0].total;
    if (totalDishes === 0) {
      if (keyword) {
        const error = new Error(`No se encontraron platos con este nombre.`);
        error.statusCode = 404;
        throw error;
      } else if (category) {
        const error = new Error(`No se encontraron platos con el estado ${category}`);
        error.statusCode = 404;
        throw error;
      } else {
        const error = new Error('No se encontraron platos.');
        error.statusCode = 404;
        throw error;
      }
    }
    // Ejecutar la consulta para obtener los empleados con paginación
    const [dishesResult] = await pool.query(query, queryParams)

    // Verificar si no se encontraron platos
    if (dishesResult.length === 0) {
      const error = new Error('No se encontraron platos con estos criterios de busqueda.')
      error.statusCode = 404;
      throw error
    }

    //GET JSON ARRAY OF THE RESULTS
    const results = dishesResult.map(dish => {
      return {
        id: dish.id_dish,
        dishes_name: dish.dishes_name,
        dishes_description: dish.dishes_description,
        price: dish.price,
        image_url: dish.image_url,
        available: dish.available,
        category: {
          id: dish.id_category,
          category_name: dish.category_name,
          category_description: dish.category_description,
        }
      }
    })
    return {
      results,
      pagination: {
        page,
        limit,
        totalDishes
      }
    };
  }
  static async getDishById(dishId) {
    const [results] = await pool.query('SELECT id_dish as id , dishes_name, dishes_description, price, available, image_url, c.id_category , c.category_name, c.category_description FROM dishes d JOIN category c ON d.category_id = c.id_category WHERE id_dish = ?', [dishId])

    const dish = results[0];
    return dish

  }
  static async createdish({ dishes_name, dishes_description, price, image_url, category_name }) {
    // 1- GET THE UUID OF THE CATEGORY
    const [categoryResult] = await pool.query('SELECT id_category as id FROM category WHERE category_name = ?', [category_name])
    if (categoryResult.length === 0) {
      throw new Error('La categoria no existe')
    }
    const [{ id }] = categoryResult
    // 3- CHECK IF THE DISH ALREADY EXISTS
    const [existingDish] = await pool.query('SELECT * FROM dishes WHERE dishes_name = ?', [dishes_name])
    if (existingDish.length > 0) {
      throw new Error('El plato ya existe')
    }
    try {
      // 4 - CREATE A NEW DISH
      await pool.query(`INSERT INTO dishes (dishes_name, dishes_description, price, image_url, category_id) VALUES (?,?,?,?,?)`, [dishes_name, dishes_description, price, image_url, id])
    } catch (error) {
      console.log(error)
      throw new Error('Error al crear el plato')
    }
    const [dishes] = await pool.query('SELECT d.id_dish as id, d.dishes_name, d.dishes_description, d.price, d.image_url, c.category_name FROM dishes d JOIN category c ON d.category_id = c.id_category WHERE d.id_dish = ?', [id])

    return dishes[0]
  }
  static async updateDish(id_dish, input) {
    const { dishes_name, dishes_description, price, available, image_url, category_name } = input

    const [categoryResult] = await pool.query('SELECT id_category  FROM category WHERE category_name = ?', [category_name])
    if (categoryResult.length === 0) {
      throw new Error('La categoria no existe')
    }
    const [{ id_category }] = categoryResult
    try {
      // 3 - UPDATE THE DISH
      const [result] = await pool.query('UPDATE dishes SET dishes_name = ?, dishes_description = ?, price = ?, available = ?, image_url = ? , category_id = ? WHERE id_dish = ?', [dishes_name, dishes_description, price, available, image_url, id_category, id_dish])
      return result

    } catch (error) {
      console.error('Error al actualizar el plato:', error); // Más detalles en consola
      throw new Error('Error al actualizar el plato')
    }
  }
  static async deleteDish(dishId) {
    try {
      await pool.query('UPDATE dishes SET available = "NO DISPONIBLE" WHERE id_dish = ?', [dishId])
    } catch (error) {
      console.log(error);
      throw new Error('Error al eliminar el plato')
    }
  }
  
}
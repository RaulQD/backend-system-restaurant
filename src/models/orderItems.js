

export class OrderItemsModel {

  static async createOrderItems(data) {
    try {
      const { order_id, dish_id, quantity, price } = data
      const [uuidResult] = await pool.query(`SELECT UUID() uuid`)
      const [{ uuid }] = uuidResult

      const sql = `INSERT INTO order_items (id_order_item, order_id, dish_id, quantity, price) VALUES (UUID_TO_BIN("${uuid}"),UUID_TO_BIN(?),UUID_TO_BIN(?),?,?)`
      const values = data.map(item = [order_id, dish_id, quantity, price])

      const [orderItem] = await pool.query(sql, [values])
      return orderItem

    } catch (error) {
      console.log(error)
      throw new Error('Error al crear el item de la orden')
    }
  }
}
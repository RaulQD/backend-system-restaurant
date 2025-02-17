import { RolModel } from "../models/rol.js";

export class RolController {
  static async getRoles(req, res) {
    try {
      const roles = await RolModel.getRoles();
      res.status(200).json(roles);
    } catch (error) {
      console.log(error)
      const statusCode = error.statusCode || 500
      return res.status(statusCode).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }
}
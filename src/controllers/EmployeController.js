import { EmployeeModel } from "../models/employees.js";
import response from "../utils/response.js";


export class EmployeeController {
  static async getEmployees(req, res) {
    const { keyword = '', status = '', page, limit } = req.query;
    const limitNumber = Number(limit) || 10;
    const pageNumber = Number(page) || 1;
    try {
      const employeeData = await EmployeeModel.getEmployees(keyword, status, pageNumber, limitNumber)
      return res.status(200).json(employeeData)
    } catch (error) {
      console.log(error);
      const statusCode = error.statusCode || 500; // Si no hay statusCode, se usará 500
      return res.status(statusCode).json({
        message: error.message || 'Error interno del servidor',
        status: false // Mostrar que no se pudo realizar la operación
      });
    }

  }
  static async getEmployeeById(req, res) {
    try {
      const { employeeId } = req.params;
      const employee = await EmployeeModel.getEmployeeById(employeeId)
      response(res, 200, employee)
    } catch (error) {
      res.status(error.statusCode).json({ error: error.message, status: false })
    }
  }
  static async updateEmployee(req, res) {
    const { employeeId } = req.params;
    const { names, last_name, dni, email, phone, address, salary } = req.body;

    try {
      // 4- UPDATE THE EMPLOYEE
      await EmployeeModel.updateEmployee(employeeId, { names, last_name, dni, email, phone, address, salary })
      return res.json({ message: 'Empleado actualizado correctamente', status: true })
    } catch (error) {
      console.error('Error en updateEmployee:', error.message);
      const statusCode = error.statusCode || 500; // Si no hay statusCode, se usa 500
      return res.status(statusCode).json({
          message: error.message || 'Error interno del servidor',
          status: false
      });
    }
  }
  static async deleteEmployee(req, res) {
    const { employeeId } = req.params;
    const { status } = req.body;
    try {
      await EmployeeModel.deleteEmployee(employeeId, status);
      return res.json({ message: 'Empleado eliminado correctamente', status: true })

    } catch (error) {
      console.log(error);
      const statusCode = error.statusCode || 500; // Si no hay statusCode, se usará 500
      return res.status(statusCode).json({
        message: error.message || 'Error interno del servidor',
        status: false // Mostrar que no se pudo realizar la operación
      });
    }
  }
}
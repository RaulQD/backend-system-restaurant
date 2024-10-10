import { EmployeeModel } from "../models/employees.js";
import response from "../utils/response.js";


export class EmployeeController {
  static async getEmployees(req, res) {
    try {
      const { searchName = '', searchLastName = '', status = '' } = req.query;
      const employees = await EmployeeModel.getEmployees(searchName, searchLastName, status)
      response(res, 200, employees)
    } catch (error) {
      return res.status(error.statusCode).json({ error: error.message, status: false })
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
    // 1- CHECK IF THE EMPLOYEE EXISTS
    const employeeResult = await EmployeeModel.findByEmployeeId(employeeId);

    // 2- CHECK IF THE EMAIL IS ALREADY IN USE
    if (email !== employeeResult.email) {
      const existinEmail = await EmployeeModel.findByEmail(email);
      if (existinEmail) {
        const error = new Error('El email ya está en uso.');
        error.statusCode = 400;
        throw error; // Lanza un error si el email está en uso
      }
    }
    // 3- CHECK IF THE DNI IS ALREADY IN USE
    if (dni !== employeeResult.dni) {
      const existingDni = await EmployeeModel.findByDni(dni);
      if (existingDni) {
        const error = new Error('El DNI ya está en uso.');
        error.statusCode = 400;
        throw error; // Lanza un error si el DNI está en uso
      }
    }
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
}
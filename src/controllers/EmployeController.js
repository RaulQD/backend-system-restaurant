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
      const { employeId } = req.params;
      const employee = await EmployeeModel.getEmployeeById(employeId)
      response(res, 200, employee)
    } catch (error) {
      res.status(error.statusCode).json({ error: error.message, status: false })
    }
  }
  static async updateEmployee(req, res) {
    const { employeeId } = req.params;
    const { names, last_name, dni, email, phone, address, salary } = req.body;
    // 1- CHECK IF THE EMPLOYEE EXISTS
    const employee = await EmployeeModel.getEmployeeById(employeeId);
    if (!employee) {
      const error = new Error('Empleado no encontrado');
      error.statusCode = 404;
      return res.status(404).json({ error: error.message, status: false })
    }

    // 2- CHECK IF THE EMAIL IS ALREADY IN USE
    if (email !== employee.email) {
      const existinEmail = await EmployeeModel.findByEmail(email);
      if (existinEmail) {
        const error = new Error('El email ya está en uso.')
        return res.status(400).json({ error: error.message, status: false })
      }
    }
    // 3- CHECK IF THE DNI IS ALREADY IN USE
    if (dni !== employee.dni) {
      const existingDni = await EmployeeModel.findByDni(dni);
      if (existingDni) {
        const error = new Error('El DNI ya está en uso.')
        return res.status(400).json({ error: error.message, status: false })
      }
    }
    try {
      // 4- UPDATE THE EMPLOYEE
      await EmployeeModel.updateEmployee(employeeId, { names, last_name, dni, email, phone, address, salary })
      return res.json({ message: 'Empleado actualizado correctamente', status: true })
    } catch (error) {
      console.log(error);
      const statusCode = error.statusCode || 500; // Si no hay statusCode, se usará 500
      return res.status(statusCode).json({
        message: error.message || 'Error interno del servidor',
        status: false // Mostrar que no se pudo realizar la operación
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
        res.status(statusCode).json({
          error:error.message || 'Error interno del servidor',
          status: false // Mostrar que no se pudo realizar la operación
        })
      }
  }
}
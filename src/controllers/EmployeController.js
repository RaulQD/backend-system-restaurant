import { cloudinary } from "../config/cloudinary.config.js";
import { EmployeeModel } from "../models/employees.js";
import { UserModel } from "../models/user.js";
import { hashPassword } from "../utils/bcrypt.js";
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
      if (!employee) {
        return res.status(404).json({ message: 'Empleado no encontrado', status: false })
      }

      return res.status(200).json(employee)
    } catch (error) {
      res.status(error.statusCode).json({ error: error.message, status: false })
    }
  }
  // static async updateEmployee(req, res) {
  //   const { employeeId } = req.params;
  //   const { names, last_name, dni, email, phone, address, salary } = req.body;

  //   try {
  //     // 4- UPDATE THE EMPLOYEE
  //     await EmployeeModel.updateEmployee(employeeId, { names, last_name, dni, email, phone, address, salary, status })
  //     return res.json({ message: 'Empleado actualizado correctamente', status: true })
  //   } catch (error) {
  //     console.error('Error en updateEmployee:', error.message);
  //     const statusCode = error.statusCode || 500; // Si no hay statusCode, se usa 500
  //     return res.status(statusCode).json({
  //       message: error.message || 'Error interno del servidor',
  //       status: false
  //     });
  //   }
  // }

  static async updateEmployee(req, res) {
    const { employeeId } = req.params;
    const { names, last_name, dni, email, phone, address, salary, password, status } = req.body;

    try {
      const existingEmployee = await EmployeeModel.getEmployeeById(employeeId);
      if (!existingEmployee) {
        const error = new Error('Empleado no encontrado');
        return res.status(404).json({ message: error.message, status: false });
      }
      //VALIDAR SI EL USUARIO INGRESA UN EMAIL QUE YA EXISTE EN LA BASE DE DATOS SI NO QUE ACTUALIZE CON EL EMAIL QUE INGRESO
      if (email && email !== existingEmployee.email) {
        const existingEmail = await EmployeeModel.findByEmail(email);
        if (existingEmail && existingEmail.id_employee !== existingEmployee.id) {
          const error = new Error('El email ya está en uso');
          return res.status(400).json({ message: error.message, status: false });
        }
      }

      let profile_picture_url = existingEmployee.profile_picture_url;
      //ACTUALIZAR LA IMAGEN DE PERFIL Y ELIMINAR LA ANTERIOR
      if (req.file) {
        if (existingEmployee.profile_picture_url) {
          //ELIMINAMOS LA IMAGEN ANTERIOR
          const public_id = existingEmployee.profile_picture_url.split('/').pop()
          const destroyResponse = await cloudinary.uploader.destroy(`employees/${public_id}`);
          if (destroyResponse.result === 'ok') {
            const error = new Error('Error al eliminar la imagen anterior');
            return res.status(400).json({ message: error.message, status: false });
          }
        }
        //SUBIR LA NUEVA IMAGEN
        const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
          folder: 'employees'
        })
        profile_picture_url = result.secure_url;
      }
      //CAMBIAR LA CONTRASEÑA DEL EMPLEADO
      let hashedPassword = existingEmployee.password;
      //SI EL USUARIO INGRESA UNA CONTRASEÑA NUEVA SE ENCRIPTA Y SE ACTUALIZA
      if (password) {
        hashedPassword = await hashPassword(password);
      }

      //ACTUALIZAR LA CONTRASEÑA DEL USUARIO
      await UserModel.updatePassword(existingEmployee.userId, hashedPassword);

      //OBJETO DEL EMPLEADO
      const updateEmployee = {
        names,
        last_name,
        dni,
        email,
        phone,
        address,
        salary,
        status,
        profile_picture_url,
      }
      //ACTUALIZAR EL EMPLEADO
      const updatedEmployee = await EmployeeModel.updateEmployee(employeeId, updateEmployee);

      return res.json({ message: 'Empleado actualizado correctamente', status: true, updatedEmployee })
    } catch (error) {
      console.log(error)
      return res.status(400).json({
        message: error.message, // Mostrar mensaje de error
        status: false
      });
    }
  }
  static async deleteEmployee(req, res) {
    const { employeeId } = req.params;
    const { status } = req.body;
    try {
      const existingEmployee = await EmployeeModel.getEmployeeById(employeeId);
      if (!existingEmployee) {
        const error = new Error('Empleado no encontrado');
        return res.status(404).json({ message: error.message, status: false });
      }

      await EmployeeModel.deleteEmployee(employeeId, status);
      return res.json({ message: 'Se actualizo el estado del empleado.', status: true })

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
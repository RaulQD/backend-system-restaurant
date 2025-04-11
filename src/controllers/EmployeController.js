import { cloudinary } from "../config/cloudinary.config.js";
import { EmployeeModel } from "../models/employees.js";
import { UserModel } from "../models/user.js";
import { hashPassword } from "../utils/bcrypt.js";


export class EmployeeController {
  static async getEmployees(req, res) {
    const { keyword = '', status = '', page, limit } = req.query;
    const limitNumber = Number(limit) || 10;
    const pageNumber = Number(page) || 1;
    try {
      const employeeData = await EmployeeModel.getEmployees(keyword, status, pageNumber, limitNumber)
      return res.status(200).json(employeeData || [])
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
      const employee = req.employee;
      const employeeResponse = {
        id_employee: employee.id_employee,
        names: employee.names,
        last_name: employee.last_name,
        dni: employee.dni,
        email: employee.email,
        phone: employee.phone,
        address: employee.address,
        salary: employee.salary,
        hire_date: employee.hire_date,
        status: employee.status,
        profile_picture_url: employee.profile_picture_url,
        user: {
          username: employee.username,
          password: employee.password
        },
        role: {
          role_name: employee.role_name
        }
      }

      return res.status(200).json(employeeResponse)
    } catch (error) {
      res.status(error.statusCode).json({ error: error.message, status: false })
    }
  }

  static async updateEmployee(req, res) {

    try {
      const { names, last_name, dni, email, phone, address, salary, password, status } = req.body;
      const employee = req.employee;

      //VALIDAR SI EL EMAIL YA EXISTE EN LA BASE DE DATOS EXCLUYENDO EL ID DEL EMPLEADO QUE SE VA A ACTUALIZAR
     const existingEmail = await EmployeeModel.findByEmailAndExcludingId(email, employee.id);
      if (existingEmail) {
        const error = new Error('El correo electronico ya está en uso');
        return res.status(400).json({ message: error.message, status: false });
      }
      
      let profile_picture_url = employee.profile_picture_url;
      //ACTUALIZAR LA IMAGEN DE PERFIL Y ELIMINAR LA ANTERIOR
      if (req.file) {
        if (employee.profile_picture_url) {
          //ELIMINAMOS LA IMAGEN ANTERIOR
          const public_id = employee.profile_picture_url.split('/').pop()
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
      const hashedPassword = password ? await hashPassword(password) : employee.password;
      //ACTUALIZAR LA CONTRASEÑA DEL USUARIO
      await UserModel.updatePassword(employee.user_id, hashedPassword);

      //ACTUALIZAR SI EL EMPLEADO CAMBIA SU ESTADO A INACTIVO, QUE EL USUARIO SE CAMBIA A INACTIVO
      if (employee.user_id) {
        const newUserStaus = status === 'no activo' ? 'INACTIVO' : 'ACTIVO';
        await UserModel.updateUserStatus(employee.user_id, newUserStaus);
      }
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
      const updatedEmployee = await EmployeeModel.updateEmployee(employee.id, updateEmployee);

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
    try {
      const { status } = req.body;
      const employee = req.employee;
      await EmployeeModel.deleteEmployee(employee.id, status);
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
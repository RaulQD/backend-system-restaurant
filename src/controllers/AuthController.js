import { cloudinary } from "../config/cloudinary.config.js";
import { pool } from "../config/mysql.js";
import { EmployeeModel } from "../models/employees.js";
import { RolModel } from "../models/rol.js";
import { UserModel } from "../models/user.js";
import { generateJWT } from "../utils/jwt.js";


export class AuthController {

    static async login(req, res) {
        const { username, password } = req.body;
        try {
            const user = await UserModel.findByUser(username);
            await UserModel.validatePassword(password, user.password);

            const token = generateJWT({
                id: user.id
            });
            console.log('token:', token);
            const employeeData = {
                id: user.id,
                username: user.username,
                full_name: `${user.names} ${user.last_name}`,
                role: {
                    name: user.role_name
                },
                token
            }

            return res.status(200).json(employeeData);

        } catch (error) {
            const statusCode = error.statusCode || 500; // Si no hay statusCode, se usará 500
            return res.status(statusCode).json({
                message: error.message || 'Error interno del servidor',
                status: false // Mostrar que no se pudo realizar la operación
            });
        }

    }
    static async createAccount(req, res) {
        const { dni, email, username, password, role_name, } = req.body

        try {

            // Validaciones se pueden ejecutar en paralelo
            await UserModel.findByUsername(username)
            await EmployeeModel.findByEmail(email)
            await EmployeeModel.findByDni(dni)

            // 6. Buscar rol por nombre
            const roleResult = await RolModel.findByRolName(role_name);

            // 4. Crear usuario
            const user = await UserModel.createUser(username, password);
            const userId = user.insertId
            //  5. Crear empleado
            if (!req.file) {
                return res.status(400).json({ error: 'La imagen del plato es requerida.' });
            }
            const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
                folder: 'employees'
            })
            const profile_picture_url = result.secure_url;
            // const employeeData = {names, last_name, dni, email, phone, address, profile_picture_url, hire_date, salary}
            const resultEmployee = await EmployeeModel.createEmployee({ ...req.body, profile_picture_url }, userId);
            const employeeId = resultEmployee.insertId;
            // 7. Asignar rol al usuario
            await RolModel.assignRoleToUser(userId, roleResult[0].id_rol);
            // 8. Obtener el empleado creado
            const employee = await EmployeeModel.findByEmployeeId(employeeId);
            return res.status(201).json({ message: 'Cuenta creada exitosamente', status: true, data: employee })
        } catch (error) {
            console.log(error)
            const statusCode = error.statusCode || 500; // Si no hay statusCode, se usará 500
            return res.status(statusCode).json({
                message: error.message || 'Error interno del servidor',
                status: false // Mostrar que no se pudo realizar la operación
            });
        }
    }


    static async getProfile(req, res) {
        try {
            const { id } = req.user
            const user = await UserModel.findByUserId(id)
            const employee = {
                id: user.id,
                username: user.username,
                employee: {
                    id_employee: user.id_employee,
                    full_name: `${user.names} ${user.last_name}`,
                    profile_picture_url: user.profile_picture_url,
                },
                role: {
                    name: user.role_name
                }
            }
            return res.status(200).json(employee)
        } catch (error) {
            console.log(error)
            const statusCode = error.statusCode || 500; // Si no hay statusCode, se usará 500
            return res.status(statusCode).json({
                error: error.message || 'Error interno del servidor',
                status: false // Mostrar que no se pudo realizar la operación
            });
        }
    }
}
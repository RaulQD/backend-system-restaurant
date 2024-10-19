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

            return res.status(200).json({
                data: {
                    id: user.id,
                    username: user.username,
                    full_name: `${user.names} ${user.last_name}`,
                    role: {
                        name: user.role_name
                    }
                },
                token
            });

        } catch (error) {
            const statusCode = error.statusCode || 500; // Si no hay statusCode, se usará 500
            return res.status(statusCode).json({
                message: error.message || 'Error interno del servidor',
                status: false // Mostrar que no se pudo realizar la operación
            });
        }

    }
    static async createAccount(req, res) {
        const { dni, email, username, password, role_name } = req.body

        try {

            // Validaciones se pueden ejecutar en paralelo
            await UserModel.findByUsername(username)
            await EmployeeModel.findByEmail(email)
            await EmployeeModel.findByDni(dni)

            // 6. Buscar rol por nombre
            const roleResult = await RolModel.findByRolName(role_name);
            // 3. Generar UUID
            const [uuidResult] = await pool.query('SELECT UUID() uuid');
            if (!uuidResult || uuidResult.length === 0) {
                throw { message: 'Error al generar el UUID', statusCode: 500 };
            }
            const [{ uuid }] = uuidResult;
            console.log(uuid);
            // 4. Crear usuario
            await UserModel.createUser(username, password, uuid);
            //  5. Crear empleado
            if (!req.file) {
                return res.status(400).json({ error: 'La imagen del plato es requerida.' });
            }
            const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
                folder: 'employees'
            })
            const profile_picture_url = result.secure_url;
            // const employeeData = {names, last_name, dni, email, phone, address, profile_picture_url, hire_date, salary}
            await EmployeeModel.createEmployee({ ...req.body, profile_picture_url }, uuid, uuid);
            // 7. Asignar rol al usuario
            await RolModel.assignRoleToUser(uuid, roleResult[0].id_rol);
            // 8. Obtener el empleado creado
            console.log('Buscando empleado por UUID:', uuid);
            const employee = await EmployeeModel.findByEmployeeId(uuid);
            console.log('Empleado encontrado:', employee);
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

            if (!user) {
                return res.status(404).json({
                    error: 'Usuario no encontrado',
                    status: false
                })
            }
            return res.status(200).json({
                data: {
                    id: user.id,
                    username: user.username,
                    full_name: `${user.names} ${user.last_name}`,
                    role: {
                        name: user.role_name
                    }
                }
            })
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
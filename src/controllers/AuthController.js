import { pool } from "../config/mysql.js";
import { EmployeeModel } from "../models/employees.js";
import { RolModel } from "../models/rol.js";
import { UserModel } from "../models/user.js";
import { checkCompare } from "../utils/bcrypt.js";
import { generateToken } from "../utils/jwt.js";


export class AuthController {

    static async login(req, res) {
        const { username, password } = req.body;
        try {
            const user = await UserModel.findByUser(username);

            console.log(user);
            await UserModel.validatePassword(password, user.password);

            const token = generateToken(user);
            console.log(token);

            return res.status(200).json({
                data: {
                    id: user.id,
                    username: user.username,
                    full_name: `${user.first_name} ${user.middle_name} ${user.last_name}`,
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
            // 5. Crear empleado
            await EmployeeModel.createEmployee(req.body, uuid, uuid);
            // 7. Asignar rol al usuario
            await RolModel.assignRoleToUser(uuid, roleResult[0].id_rol);
            // 8. Obtener el empleado creado
            const employee = await EmployeeModel.findByEmployeeId(uuid);

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
}
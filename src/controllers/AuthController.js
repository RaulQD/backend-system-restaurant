import { pool } from "../config/mysql.js";
import { AuthModel } from "../models/auth.js";
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
            const token = generateToken(user);

            await AuthModel.login(username, password);
            return res.status(200).json({
                user: {
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
            console.log(error);
            return res.status(400).json({
                message: error.message, // Mostrar mensaje de error
                status: false // Mostrar que no se pudo realizar la operación
            });
        }

    }
    static async createAccount(req, res) {
        const { dni, email, username, password, role_name } = req.body
        try {
            const existingUser = await UserModel.findByUsername(username)
            console.log(existingUser)

            const existingEmail = await EmployeeModel.findByEmail(email)
            console.log(existingEmail)

            const existingDni = await EmployeeModel.findByDni(dni)
            console.log(existingDni)
            // 3. Generar UUID
            const [uuidResult] = await pool.query('SELECT UUID() uuid');
            const [{ uuid }] = uuidResult;
            console.log('UUID generado:', uuid);

            // 4. Crear usuario
            const userId = await UserModel.createUser(username, password, uuid);
            console.log('Usuario creado:', userId);
            // 5. Crear empleado
            const createEmployee = await EmployeeModel.createEmployee(req.body, uuid, userId);
            console.log('Empleado creado:', createEmployee);

            // 6. Buscar rol por nombre
            const roleResult = await RolModel.findByRolName(role_name);
            console.log(roleResult);

            // 7. Asignar rol al usuario
            await RolModel.assignRoleToUser(uuid, roleResult[0].id_rol);

            // 8. Obtener el empleado creado
            const employee = await EmployeeModel.findByEmployeeId(uuid);

            return res.status(201).json({ message: 'Cuenta creada exitosamente', status: true, data: employee[0] })
        } catch (error) {
            console.log(error)
            return res.status(400).json({
                message: error.message, // Mostrar mensaje de error
                status: false
            });
        }

    }
}
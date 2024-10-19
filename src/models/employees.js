import { pool } from "../config/mysql.js";
import { ClientError } from "../utils/error.js";


export class EmployeeModel {
  static async findByEmail(email) {
    const [existingEmail] = await pool.query('SELECT * FROM employees WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      const error = new Error('El email ya existe')
      error.statusCode = 400;
      throw error;
    }
    return existingEmail;
  }
  static async findByDni(dni) {
    const [existingDni] = await pool.query('SELECT * FROM employees WHERE dni = ?', [dni]);
    if (existingDni.length > 0) {
      const error = new Error('El DNI ya existe')
      error.statusCode = 400;
      throw error;
    }
    return existingDni;
  }
  static async findByEmployeeId(uuid) {
    const [employeeResult] = await pool.query(`SELECT BIN_TO_UUID(id_employee) id, names, last_name, status, salary, DATE_FORMAT(hire_date, '%Y-%m-%d') as hire_date FROM employees WHERE id_employee = UUID_TO_BIN(?)`, [uuid])
    const employee = employeeResult[0];
    if (employee.length === 0) {
      const error = new Error('Empleado no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return employee;
  }
  static async getEmployees(keyword, status, page = 1, limit = 10) {

    let offset = (page - 1) * limit;

    let query = `SELECT BIN_TO_UUID(e.id_employee) id, e.names, e.last_name, e.profile_picture_url, e.salary, DATE_FORMAT(e.hire_date, '%Y-%m-%d') as hire_date, e.status, r.role_name FROM employees e JOIN users u ON e.user_id = u.id_user JOIN user_roles ur ON u.id_user = ur.user_id JOIN roles r ON ur.role_id = r.id_rol WHERE 1=1`

    // Consulta para contar el número total de empleados
    let countQuery = `SELECT COUNT(*) as total FROM employees e JOIN users u ON e.user_id = u.id_user JOIN user_roles ur ON u.id_user = ur.user_id JOIN roles r ON ur.role_id = r.id_rol WHERE 1=1
`;
    const queryParams = []

    if (keyword) {
      query += ` AND (LOWER(CONCAT(e.names, ' ', e.last_name)) LIKE LOWER(CONCAT('%', ?, '%')))`
      countQuery += ` AND (LOWER(CONCAT(e.names, ' ', e.last_name)) LIKE LOWER(CONCAT('%', ?, '%')))`
      queryParams.push(keyword)
    }

    if (status) {
      query += ` AND e.status = ?`
      countQuery += ` AND e.status = ?`
      queryParams.push(status)
    }
    // Agregar paginación
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    // Ejecutar la consulta de conteo para obtener el total de empleados
    const countQueryParams = [...queryParams];
    const [countResult] = await pool.query(countQuery, countQueryParams);
    const totalEmployees = countResult[0].total;

    if (totalEmployees === 0) {
      if (keyword && status) {
        const error = new Error(`No se encontraron empleados con el nombre ${keyword} y el estado ${status}.`);
        error.statusCode = 404;
        throw error;
      } else if (keyword) {
        const error = new Error(`No se encontraron empleados con este nombre ${keyword} .`);
        error.statusCode = 404;
        throw error;
      } else if (status) {
        const error = new Error(`No se encontraron empleados con el estado sugerido.`);
        error.statusCode = 404;
        throw error;
      } else {
        const error = new Error('No se encontraron empleados.');
        error.statusCode = 404;
        throw error;
      }
    }
    // Ejecutar la consulta para obtener los empleados con paginación
    const [employeeResult] = await pool.query(query, queryParams)

    if (employeeResult.length === 0) {
      const error = new Error('No se encontraron empleados con estos criterios de busqueda.')
      error.statusCode = 404;
      throw error
    }

    const result = employeeResult.map((employee) => {
      return {
        id: employee.id,
        names: employee.names,
        last_name: employee.last_name,
        salary: employee.salary,
        hire_date: employee.hire_date,
        status: employee.status,
        profile_picture_url: employee.profile_picture_url,
        role: {
          name: employee.role_name
        }
      }
    })
    return {
      result,
      pagination: {
        page,
        limit,
        totalEmployees
      }
    };
  }
  static async getEmployeeById(uuid) {

    // if (!uuid) {
    //   throw new Error('UUID no proporcionado');
    // }
    const [employeeResult] = await pool.query(`SELECT BIN_TO_UUID(e.id_employee) id, e.names, e.last_name, e.dni, e.email, e.phone, e.address, e.salary, DATE_FORMAT(e.hire_date, '%Y-%m-%d') as hire_date, e.status, r.role_name FROM employees e JOIN users u ON e.user_id = u.id_user JOIN user_roles ur ON u.id_user = ur.user_id JOIN roles r ON ur.role_id = r.id_rol WHERE e.id_employee = UUID_TO_BIN(?)`, [uuid])

    if (employeeResult.length === 0) {
      const error = new Error('Empleado no encontrado');
      error.statusCode = 404;
      throw error;
    }
    const employee = employeeResult[0];
    //GET JSON ARRAY OF THE RESULTS
    return {
      id: employee.id,
      names: employee.names,
      last_name: employee.last_name,
      dni: employee.dni,
      email: employee.email,
      phone: employee.phone,
      address: employee.address,
      salary: employee.salary,
      hire_date: employee.hire_date,
      status: employee.status,
      role: {
        name: employee.role_name
      }
    }

  }
  static async createEmployee(data, uuid, userId) {
    const { names, last_name, dni, email, phone, address, profile_picture_url, hire_date, salary } = data
    const [employeeResult] = await pool.query(`INSERT INTO employees (id_employee, names, last_name, dni, email, phone, address, profile_picture_url, salary, hire_date, user_id) VALUES (UUID_TO_BIN("${uuid}"), ?, ?, ?, ?, ?, ?, ?, ?, ?, UUID_TO_BIN("${uuid}"))`,
      [names, last_name, dni, email, phone, address, profile_picture_url, parseFloat(salary), hire_date, userId]);
    return employeeResult;
  }

  static async updateEmployee(uuid, data) {
    const { names, last_name, dni, email, phone, address, salary } = data
    // Verificar si el empleado existe
    const employee = await this.getEmployeeById(uuid);
    if (!employee) {
      const error = new Error('Empleado no encontrado');
      error.statusCode = 404;
      throw error;
    }
    //VERIFICAR SI EL EMAIL YA EXISTE
    const existingEmail = await this.findByEmail(email);
    if (existingEmail) {
      const error = new Error('El email ya está en uso')
      error.statusCode = 400;
      throw error;
    }

    const [employeeResult] = await pool.query(`UPDATE employees SET names = ?, last_name = ?, dni = ?, email = ?, phone = ?, address = ?, salary = ? WHERE id_employee = UUID_TO_BIN(?)`, [names, last_name, dni, email, phone, address, salary, uuid]);
    if (employeeResult.affectedRows === 0) {
      const error = new Error('No se pudo actualizar el empleado');
      error.statusCode = 400;
      throw error; // Lanza error si no se afectaron filas
    }
    return employeeResult;
  }

  static async deleteEmployee(uuid) {


    const [employeeResult] = await pool.query(`UPDATE employees SET status = 'no activo' WHERE id_employee = UUID_TO_BIN(?)`, [uuid]);

    if (employeeResult.affectedRows === 0) {
      const error = new Error('Empleado no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return employeeResult;
  }
}
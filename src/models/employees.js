import { pool } from "../config/mysql.js";


export class EmployeeModel {
  static async findByEmail(email) {
    try {
      const [existingEmail] = await pool.query('SELECT id_employee, email FROM employees WHERE email = ?', [email]);
      if (existingEmail.length > 0) {
        const error = new Error('El email ya existe')
        error.statusCode = 400;
        throw error;
      }
      return existingEmail;
    } catch (error) {
      console.error('Error al buscar el email:', error); // Más detalles en consola
      throw new Error('Error al buscar el email')
    }
  }
  static async findByDni(dni) {
    try {
      const [existingDni] = await pool.query('SELECT * FROM employees WHERE dni = ?', [dni]);
      if (existingDni.length > 0) {
        const error = new Error('El DNI ya existe')
        error.statusCode = 400;
        throw error;
      }
      return existingDni;
    } catch (error) {
      console.error('Error al buscar el DNI:', error); // Más detalles en consola
      throw new Error('Error al buscar el DNI')
    }
  }
  static async findByEmployeeId(employee_id) {
    try {
      const [employeeResult] = await pool.query(`SELECT id_employee , names, last_name, status, salary, DATE_FORMAT(hire_date, '%Y-%m-%d') as hire_date FROM employees WHERE id_employee = ?`, [employee_id])
      if (employeeResult.length === 0) {
        return null;
      }
      const employee = employeeResult[0];
      return employee;
    } catch (error) {
      console.error('Error al obtener el empleado:', error); // Más detalles en consola
      throw new Error('Error al obtener el empleado')
    }
  }
  static async findByEmailAndExcludingId(email, id) {
    try {
      const [result] = await pool.query('SELECT id_employee, email FROM employees WHERE email = ? AND id_employee != ?', [email, id]);
      return result[0] || null; // Retorna el primer resultado o null si no hay coincidencias
    } catch (error) {
      console.error('Error al buscar el email:', error); // Más detalles en consola
      throw new Error('Error al buscar el email')

    }
  }
  static async getEmployees(keyword, status, page = 1, limit = 10) {

    let offset = (page - 1) * limit;

    let query = `SELECT e.id_employee, e.names, e.last_name, e.profile_picture_url, e.salary, DATE_FORMAT(e.hire_date, '%Y-%m-%d') as hire_date, e.status, r.role_name FROM employees e JOIN users u ON e.user_id = u.id_user JOIN user_roles ur ON u.id_user = ur.user_id JOIN roles r ON ur.role_id = r.id_rol WHERE 1=1`

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
    // Agregar ORDER BY antes de la paginación
    query += ` ORDER BY id_employee ASC`;
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
        id: employee.id_employee,
        names: employee.names,
        last_name: employee.last_name,
        salary: employee.salary,
        hire_date: employee.hire_date,
        status: employee.status,
        profile_picture_url: employee.profile_picture_url,
        role: {
          role_name: employee.role_name
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
  static async getEmployeeById(id) {

    try {
      const [employeeResult] = await pool.query(`SELECT e.id_employee as id, e.names, e.last_name, e.dni, e.email, e.phone, e.address, e.salary, e.profile_picture_url, DATE_FORMAT(e.hire_date, '%Y-%m-%d') as hire_date, e.status, r.role_name, u.username, u.password, u.id_user as user_id FROM employees e JOIN users u ON e.user_id = u.id_user JOIN user_roles ur ON u.id_user = ur.user_id JOIN roles r ON ur.role_id = r.id_rol WHERE e.id_employee = ?`, [id])

      const employee = employeeResult[0];
      //GET JSON ARRAY OF THE RESULTS
      return employee

    } catch (error) {
      console.error('Error al obtener el empleado:', error); // Más detalles en consola
      throw new Error('Error al obtener el empleado')
    }
  }
  static async createEmployee(data, userId) {
    const { names, last_name, dni, email, phone, address, profile_picture_url, hire_date, salary } = data
    try {
      const [employeeResult] = await pool.query(`INSERT INTO employees (names, last_name, dni, email, phone, address, profile_picture_url, salary, hire_date, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [names, last_name, dni, email, phone, address, profile_picture_url, parseFloat(salary), hire_date, userId]);
      return employeeResult;
    } catch (error) {
      console.error('Error al crear el empleado:', error); // Más detalles en consola
      throw new Error('Error al crear el empleado')
    }
  }

  static async updateEmployee(idEmployee, data) {
    const { names, last_name, dni, email, phone, address, salary, status, profile_picture_url } = data
    try {
      await pool.query(`UPDATE employees SET names = ?, last_name = ?, dni = ?, email = ?, phone = ?, address = ?, salary = ?, status = ?, profile_picture_url = ? WHERE id_employee = ?`, [names, last_name, dni, email, phone, address, salary, status, profile_picture_url, idEmployee]);
    } catch (error) {
      console.error('Error al actualizar el empleado:', error); // Más detalles en consola
      throw new Error('Error al actualizar el empleado')
    }
  }

  static async deleteEmployee(uuid) {

    try {
      const [employeeResult] = await pool.query(`UPDATE employees SET status = 'no activo' WHERE id_employee = ?`, [uuid]);
      return employeeResult;

    } catch (error) {
      throw new Error('Error al eliminar el empleado')
    }
  }
}
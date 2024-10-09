import { pool } from "../config/mysql.js";


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
    const [employeeResult] = await pool.query(`SELECT BIN_TO_UUID(id_employee) id, names, last_name, status, salary, DATE_FORMAT(hire_date, '%Y-%m-%d') as hire_date FROM employees WHERE e.id_employee = UUID_TO_BIN(?)`, [uuid])
    if (employee.length === 0) {
      const error = new Error('Empleado no encontrado');
      error.statusCode = 404;
      throw error;
    }
    const employee = employeeResult[0];
    return employee;
  }
  static async getEmployees(searchName, searchLastName, status) {

    let query = `SELECT BIN_TO_UUID(e.id_employee) id, e.names, e.last_name, e.salary, DATE_FORMAT(e.hire_date, '%Y-%m-%d') as hire_date, e.status, r.role_name FROM employees e JOIN users u ON e.user_id = u.id_user JOIN user_roles ur ON u.id_user = ur.user_id JOIN roles r ON ur.role_id = r.id_rol WHERE 1=1`

    const queryParams = []
    if (searchName) {
      query += ` AND (LOWER(e.names) LIKE LOWER(CONCAT('%', ?, '%')))`
      queryParams.push(searchName)
    }
    if (searchLastName) {
      query += ` AND (LOWER(e.last_name) LIKE LOWER(CONCAT('%', ?, '%')))`
      queryParams.push(searchLastName)
    }
    if (status) {
      query += ` AND e.status = ?`
      queryParams.push(status)
    }
    const [employeeResult] = await pool.query(query, queryParams)
    if (employeeResult.length === 0) {
      const error = new Error('No se encontraron empleados con estos criterios de busqueda.')
      error.statusCode = 404;
      throw error
    }

    const employees = employeeResult.map((employee) => {
      return {
        id: employee.id,
        names: employee.names,
        last_name: employee.last_name,
        salary: employee.salary,
        hire_date: employee.hire_date,
        status: employee.status,
        role: {
          name: employee.role_name
        }
      }
    })

    return employees;
  }
  static async getEmployeeById(uuid) {
    const [employeeResult] = await pool.query(`SELECT BIN_TO_UUID(e.id_employee) id, e.names, e.last_name, e.dni, e.email, e.phone, e.address, e.salary, DATE_FORMAT(e.hire_date, '%Y-%m-%d') as hire_date, e.status, r.role_name FROM employees e JOIN users u ON e.user_id = u.id_user JOIN user_roles ur ON u.id_user = ur.user_id JOIN roles r ON ur.role_id = r.id_rol WHERE e.id_employee = UUID_TO_BIN(?)`, [uuid])
    if (employeeResult.length === 0) {
      const error = new Error('Empleado no encontrado');
      error.statusCode = 404;
      throw error;
    }
    const employee = employeeResult[0];
    //GET JSON ARRAY OF THE RESULTS
    const response = {
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

    return response;
  }
  static async createEmployee(data, uuid, userId) {
    const { names, last_name, dni, email, phone, address, hire_date, salary } = data
    const [employeeResult] = await pool.query(`INSERT INTO employees (id_employee,names, last_name, dni, email, phone, address, salary, hire_date, user_id) VALUES (UUID_TO_BIN("${uuid}"),?,?, ?, ?, ?, ?,?, ?, UUID_TO_BIN("${uuid}"))`,
      [names, last_name, dni, email, phone, address, parseFloat(salary), hire_date, userId]);
    return employeeResult;
  }

  static async updateEmployee(uuid, data) {
    const { names, last_name, dni, email, phone, address, salary } = data
    const [employeeResult] = await pool.query(`UPDATE employees SET names = ?, last_name = ?, dni = ?, email = ?, phone = ?, address = ?, salary = ? WHERE id_employee = UUID_TO_BIN(?)`, [names, last_name, dni, email, phone, address, salary, uuid]);

    return employeeResult;
  }
}
import { pool } from "../config/mysql.js";

export class EmployeeModel {
  static async findByEmail(email) {
    const [existingEmail] = await pool.query('SELECT * FROM employees WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      throw new Error('El correo electronico ya existe')
    }
    return existingEmail;
  }

  static async findByDni(dni) {
    const [existingDni] = await pool.query('SELECT * FROM employees WHERE dni = ?', [dni]);
    if (existingDni.length > 0) {
      throw new Error('El DNI ya existe')
    }
    return existingDni;
  }
  static async findByEmployeeId(uuid) {
    const [employee] = await pool.query('SELECT BIN_TO_UUID(id_employee) id, first_name, middle_name, last_name, dni, email, phone, address, salary FROM employees WHERE id_employee = UUID_TO_BIN(?)', [uuid])
    console.log(employee);
    if (employee.length === 0) {
      throw new Error('El empleado no fue encontrado');
    }
    return employee;
  }
  static async getEmployee(){
    const [employee] = await pool.query('SELECT BIN_TO_UUID(e.id_employee), e.first_name, e.middle_name, e.last_name, e.email, e.salary, r.role_name FROM employees e JOIN ')
  }

  static async createEmployee(data, uuid, userId) {
    const { first_name, middle_name, last_name, dni, email, phone, address,hire_date, salary } = data
  
    const [employeeResult] = await pool.query(`INSERT INTO employees (id_employee,first_name, middle_name, last_name, dni, email, phone, address, salary, hire_date, user_id) VALUES (UUID_TO_BIN("${uuid}"),?, ?, ?, ?, ?, ?, ?,?, ?, UUID_TO_BIN("${uuid}"))`,
      [first_name, middle_name, last_name, dni, email, phone, address, parseFloat(salary),hire_date, userId]);
    return employeeResult;
  }
}
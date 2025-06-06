import mysql from 'mysql2/promise';
import fs from 'fs';


export const pool = mysql.createPool({
  host: process.env.MYSQLHOST || 'localhost',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || '1234',
  database: process.env.MYSQL_DATABASE || 'sistema_restaurant',
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    ca: fs.readFileSync('../ssl/ca-certificate.crt'),
    rejectUnauthorized: false
  }
});

export const connectMysql = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to the database successfully');
    return connection;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
};
DROP DATABASE sistema_restaurant;
CREATE DATABASE sistema_restaurant;
USE sistema_restaurant;
CREATE TABLE users (
	id_user INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
CREATE TABLE roles (
	id_rol INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(255) NOT NULL
);
CREATE TABLE user_roles (
	user_id INT ,
    role_id INT,
    primary key(user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id_user),
    FOREIGN KEY (role_id) REFERENCES roles(id_rol)
);

CREATE TABLE employees(
	id_employee INT PRIMARY KEY AUTO_INCREMENT,
    names VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAr(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    dni VARCHAR(10) NOT NULL,
    profile_picture_url VARCHAR(255),
	salary DECIMAL(10,2) NOT NULL,
    hire_date DATE NOT NULL,
    user_id INT NOT NULL,
    status ENUM('activo','en vacaciones', 'suspendido','no activo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id_user)
);
CREATE TABLE dishes (
	id_dish INT PRIMARY KEY AUTO_INCREMENT,
    dishes_name VARCHAR(255) NOT NULL,
    dishes_description TEXT,
    price DECIMAL(10,2) NOT NULL,
    available BOOLEAN DEFAULT TRUE,
    category_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES category(id_category)
);
CREATE TABLE category(
	id_category INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(255) NOT NULL,
    category_description VARCHAR(255) NOT NULL
);

CREATE TABLE rooms (
    id_room INT PRIMARY KEY AUTO_INCREMENT,
    room_name VARCHAR(50) NOT NULL UNIQUE,
    num_tables INT NOT NULL
);

CREATE TABLE tables (
    id_table INT PRIMARY KEY AUTO_INCREMENT,
    num_table INT NOT NULL,
    capacity_table INT NOT NULL,
    room_id INT NOT NULL,
    FOREIGN KEY (room_id) REFERENCES Rooms(id_room)
);

CREATE TABLE use_table(
	id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    table_id INT NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    status ENUM('disponible','ocupado') NOT NULL DEFAULT 'disponible',
	FOREIGN KEY (employee_id) REFERENCES employees(id_employee),
    FOREIGN KEY (table_id) REFERENCES tables(id_table)
);

CREATE TABLE orders (
  id_order INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  table_id INT NOT NULL,
  status ENUM('pendiente','en preparación', 'servido', 'cancelado') DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id_employee),
  FOREIGN KEY (table_id) REFERENCES tables(id_table)
);

CREATE TABLE order_details (
  id_order_item INT PRIMARY KEY AUTO_INCREMENT,
  order_id  INT NOT NULL,
  dish_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id_order) ON DELETE CASCADE,
  FOREIGN KEY (dish_id) REFERENCES dishes(id_dish)
);

ALTER TABLE employees CHANGE porfile_picture_url profile_picture_url VARCHAR(255) NULL AFTER address;
ALTER TABLE dishes CHANGE available available ENUM('Disponible','No Disponible') default 'Disponible';
ALTER TABLE dishes ADD image_url VARCHAR(255);
ALTER TABLE tables ADD status ENUM('Disponible','Ocupado') default 'Disponible';
ALTER TABLE orders 	CHANGE TOTAL total decimal(10,2) DEFAULT 0;

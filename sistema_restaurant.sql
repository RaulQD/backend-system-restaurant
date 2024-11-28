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
	user_id INT,
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
    profile_picture_url VARCHAR(255),
    dni VARCHAR(10) NOT NULL,
	salary DECIMAL(10,2) NOT NULL,
    hire_date DATE NOT NULL,
    user_id INT,
    status ENUM('activo','en vacaciones', 'suspendido','no activo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id_user)
);


CREATE TABLE category(
	id_category INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(255) NOT NULL,
    category_description VARCHAR(255) NOT NULL
);
CREATE TABLE dishes (
	id_dish INT PRIMARY KEY AUTO_INCREMENT,
    dishes_name VARCHAR(255) NOT NULL,
    dishes_description TEXT,
    price DECIMAL,
    available ENUM('No Disponible','Disponible') default 'Disponible',
    category_id INT,
    FOREIGN KEY (category_id) REFERENCES category(id_category)
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
	status ENUM('DISPONIBLE','OCUPADO') NOT NULL DEFAULT 'DISPONIBLE',
    room_id INT,
    FOREIGN KEY (room_id) REFERENCES Rooms(id_room)
);

CREATE TABLE use_table(
	id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    table_id INT NOT NULL,
	start_time TIMESTAMP null,
    end_time TIMESTAMP NULL,
	FOREIGN KEY (employee_id) REFERENCES employees(id_employee),
    FOREIGN KEY (table_id) REFERENCES tables(id_table)
);

CREATE TABLE orders (
    id_order INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    table_id INT NOT NULL,
    order_status ENUM('PENDIENTE', 'EN PREPARACIÓN', 'SERVIDO', 'CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
    total DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id_employee),
    FOREIGN KEY (table_id) REFERENCES tables(id_table)
);


CREATE TABLE order_details (
    id_item INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    dish_id INT NOT NULL,
    quantity INT NOT NULL,
	unit_price DECIMAL(10,2) NOT NULL,  -- Precio unitario del plato al momento de la orden
	subtotal DECIMAL(10,2) NOT NULL,   -- Subtotal calculado para la cantidad de platos
    status ENUM('PENDIENTE', 'EN PREPARACIÓN', 'SERVIDO', 'COMPLETADO', 'CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
	special_requests VARCHAR(255),   -- Peticiones especiales del cliente
    FOREIGN KEY (order_id) REFERENCES orders(id_order),
    FOREIGN KEY (dish_id) REFERENCES dishes(id_dish)
);

ALTER TABLE employees CHANGE image_url profile_picture_url VARCHAR(255) NULL;
ALTER TABLE dishes ADD image_url VARCHAR(255) NULL;
ALTER TABLE orders CHANGE employee_id employee_id INT NOT NULL;
ALTER TABLE orders CHANGE total  total DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE dishes CHANGE price price DECIMAL(10,2) NOT NULL;
ALTER TABLE tables CHANGE attend_start attend_start TIMESTAMP NULL;
ALTER TABLE tables CHANGE status status ENUM('DISPONIBLE','OCUPADO') NOT NULL DEFAULT 'DISPONIBLE';
ALTER TABLE orders CHANGE order_status order_status ENUM('PENDIENTE', 'EN PREPARACIÒN','SERVIDO', 'COMPLETADO','CERRADO', 'CANCELADO') NOT NULL DEFAULT 'PENDIENTE';

ALTER TABLE tables
ADD FOREIGN KEY (employee_id) REFERENCES employees(id_employee);
ALTER TABLE order_details DROP COLUMN price;
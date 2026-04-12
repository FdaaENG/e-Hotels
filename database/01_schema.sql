CREATE DATABASE IF NOT EXISTS ehotels;
USE ehotels;

-- =========================
-- HOTEL CHAIN
-- =========================
CREATE TABLE hotel_chain (
    chain_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    central_office_address VARCHAR(255) NOT NULL,
    num_hotels INT NOT NULL
);

CREATE TABLE chain_email (
    chain_id INT NOT NULL,
    email VARCHAR(150) NOT NULL,
    PRIMARY KEY (chain_id, email),
    CONSTRAINT fk_chain_email_chain
        FOREIGN KEY (chain_id) REFERENCES hotel_chain(chain_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE chain_phone (
    chain_id INT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    PRIMARY KEY (chain_id, phone_number),
    CONSTRAINT fk_chain_phone_chain
        FOREIGN KEY (chain_id) REFERENCES hotel_chain(chain_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- HOTEL
-- =========================
CREATE TABLE hotel (
    hotel_id INT AUTO_INCREMENT PRIMARY KEY,
    chain_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    star_category INT NOT NULL,
    num_rooms INT NOT NULL,
    CONSTRAINT fk_hotel_chain
        FOREIGN KEY (chain_id) REFERENCES hotel_chain(chain_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE hotel_email (
    hotel_id INT NOT NULL,
    email VARCHAR(150) NOT NULL,
    PRIMARY KEY (hotel_id, email),
    CONSTRAINT fk_hotel_email_hotel
        FOREIGN KEY (hotel_id) REFERENCES hotel(hotel_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE hotel_phone (
    hotel_id INT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    PRIMARY KEY (hotel_id, phone_number),
    CONSTRAINT fk_hotel_phone_hotel
        FOREIGN KEY (hotel_id) REFERENCES hotel(hotel_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- ROOM
-- =========================
CREATE TABLE room (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    capacity VARCHAR(20) NOT NULL,
    view_type VARCHAR(20) NOT NULL,
    is_extendable BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_room_hotel
        FOREIGN KEY (hotel_id) REFERENCES hotel(hotel_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE room_issue (
    issue_id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL,
    reported_at DATETIME NOT NULL,
    resolved_at DATETIME NULL,
    CONSTRAINT fk_room_issue_room
        FOREIGN KEY (room_id) REFERENCES room(room_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE amenity (
    amenity_id INT AUTO_INCREMENT PRIMARY KEY,
    amenity_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE room_amenity (
    room_id INT NOT NULL,
    amenity_id INT NOT NULL,
    PRIMARY KEY (room_id, amenity_id),
    CONSTRAINT fk_room_amenity_room
        FOREIGN KEY (room_id) REFERENCES room(room_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_room_amenity_amenity
        FOREIGN KEY (amenity_id) REFERENCES amenity(amenity_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- =========================
-- CUSTOMER
-- =========================
CREATE TABLE customer (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    id_type VARCHAR(50) NOT NULL,
    id_number VARCHAR(100) NOT NULL,
    registration_date DATE NOT NULL
);

-- =========================
-- EMPLOYEE / ROLE
-- =========================
CREATE TABLE employee (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    ssn_sin VARCHAR(50) NOT NULL UNIQUE,
    CONSTRAINT fk_employee_hotel
        FOREIGN KEY (hotel_id) REFERENCES hotel(hotel_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE role (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE employee_role (
    employee_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (employee_id, role_id),
    CONSTRAINT fk_employee_role_employee
        FOREIGN KEY (employee_id) REFERENCES employee(employee_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_employee_role_role
        FOREIGN KEY (role_id) REFERENCES role(role_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE manages (
    hotel_id INT PRIMARY KEY,
    employee_id INT NOT NULL UNIQUE,
    CONSTRAINT fk_manages_hotel
        FOREIGN KEY (hotel_id) REFERENCES hotel(hotel_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_manages_employee
        FOREIGN KEY (employee_id) REFERENCES employee(employee_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- =========================
-- BOOKING / RENTING / PAYMENT
-- =========================
CREATE TABLE booking (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NULL,
    room_id INT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    CONSTRAINT fk_booking_customer
        FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_booking_room
        FOREIGN KEY (room_id) REFERENCES room(room_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE renting (
    renting_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NULL,
    room_id INT NULL,
    employee_id INT NOT NULL,
    checkin_date DATE NOT NULL,
    checkout_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    CONSTRAINT fk_renting_customer
        FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_renting_room
        FOREIGN KEY (room_id) REFERENCES room(room_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_renting_employee
        FOREIGN KEY (employee_id) REFERENCES employee(employee_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    renting_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    method VARCHAR(50) NOT NULL,
    CONSTRAINT fk_payment_renting
        FOREIGN KEY (renting_id) REFERENCES renting(renting_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- ARCHIVES
-- NO FKs to CUSTOMER / ROOM / HOTEL
-- =========================
CREATE TABLE booking_archive (
    booking_archive_id INT AUTO_INCREMENT PRIMARY KEY,
    original_booking_id INT NOT NULL UNIQUE,
    customer_id_value INT,
    customer_name VARCHAR(150),
    customer_address VARCHAR(255),
    hotel_name VARCHAR(150),
    room_id_value INT,
    capacity VARCHAR(20),
    price DECIMAL(10,2),
    view_type VARCHAR(20),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    archived_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE renting_archive (
    renting_archive_id INT AUTO_INCREMENT PRIMARY KEY,
    original_renting_id INT NOT NULL UNIQUE,
    customer_id_value INT,
    customer_name VARCHAR(150),
    customer_address VARCHAR(255),
    room_id_value INT,
    capacity VARCHAR(20),
    price DECIMAL(10,2),
    view_type VARCHAR(20),
    hotel_name VARCHAR(150),
    hotel_address VARCHAR(255),
    checkin_date DATE NOT NULL,
    checkout_date DATE NOT NULL,
    employee_id_value INT,
    archived_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
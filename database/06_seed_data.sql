USE ehotels;

-- =========================================================
-- HOTEL CHAINS
-- =========================================================
INSERT INTO hotel_chain (name, central_office_address, num_hotels) VALUES
('Luxury Stay Group', '100 King St W, Toronto, ON, Canada', 0),
('Comfort Inns Network', '200 Sparks St, Ottawa, ON, Canada', 0),
('Northern Suites', '300 Rue Sainte-Catherine, Montreal, QC, Canada', 0);

-- =========================================================
-- CHAIN EMAILS
-- =========================================================
INSERT INTO chain_email (chain_id, email) VALUES
(1, 'contact@luxurystay.com'),
(1, 'support@luxurystay.com'),
(2, 'info@comfortinns.com'),
(3, 'hello@northernsuites.com');

-- =========================================================
-- CHAIN PHONES
-- =========================================================
INSERT INTO chain_phone (chain_id, phone_number) VALUES
(1, '613-555-1001'),
(1, '613-555-1002'),
(2, '613-555-2001'),
(3, '514-555-3001');

-- =========================================================
-- HOTELS
-- =========================================================
INSERT INTO hotel (chain_id, name, address, city, state, postal_code, country, star_category, num_rooms) VALUES
(1, 'Luxury Stay Ottawa', '111 Wellington St, Ottawa', 'Ottawa', 'Ontario', 'K1A0A1', 'Canada', 5, 120),
(1, 'Luxury Stay Toronto', '222 Bay St, Toronto', 'Toronto', 'Ontario', 'M5J2J5', 'Canada', 5, 200),
(2, 'Comfort Inn Downtown', '333 Rideau St, Ottawa', 'Ottawa', 'Ontario', 'K1N5Y7', 'Canada', 4, 90),
(3, 'Northern Suites Montreal', '444 Sherbrooke St W, Montreal', 'Montreal', 'Quebec', 'H3A1B9', 'Canada', 3, 75);

-- =========================================================
-- HOTEL EMAILS
-- =========================================================
INSERT INTO hotel_email (hotel_id, email) VALUES
(1, 'ottawa@luxurystay.com'),
(2, 'toronto@luxurystay.com'),
(3, 'downtown@comfortinns.com'),
(4, 'montreal@northernsuites.com');

-- =========================================================
-- HOTEL PHONES
-- =========================================================
INSERT INTO hotel_phone (hotel_id, phone_number) VALUES
(1, '613-555-1100'),
(2, '416-555-2200'),
(3, '613-555-3300'),
(4, '514-555-4400');

-- =========================================================
-- ROOMS
-- =========================================================
INSERT INTO room (hotel_id, price, capacity, view_type, is_extendable) VALUES
(1, 250.00, 'Single', 'mountain', FALSE),
(1, 320.00, 'Double', 'mountain', TRUE),
(1, 500.00, 'Suite', 'mountain', TRUE),

(2, 275.00, 'Single', 'sea', FALSE),
(2, 350.00, 'Double', 'sea', TRUE),
(2, 550.00, 'Suite', 'sea', TRUE),

(3, 180.00, 'Single', 'mountain', FALSE),
(3, 220.00, 'Double', 'mountain', TRUE),

(4, 160.00, 'Single', 'sea', FALSE),
(4, 210.00, 'Double', 'sea', TRUE);

-- =========================================================
-- ROOM ISSUES
-- =========================================================
INSERT INTO room_issue (room_id, type, description, status, reported_at, resolved_at) VALUES
(2, 'Plumbing', 'Bathroom sink leaking', 'Open', '2026-03-20 10:00:00', NULL),
(5, 'Electrical', 'Lamp not working', 'Fixed', '2026-03-15 14:30:00', '2026-03-16 11:00:00'),
(9, 'Cleaning', 'Room not cleaned properly', 'Open', '2026-03-25 09:15:00', NULL);

-- =========================================================
-- AMENITIES
-- =========================================================
INSERT INTO amenity (amenity_name) VALUES
('WiFi'),
('TV'),
('Air Conditioning'),
('Mini Bar'),
('Balcony');

-- =========================================================
-- ROOM AMENITIES
-- =========================================================
INSERT INTO room_amenity (room_id, amenity_id) VALUES
(1, 1), (1, 2),
(2, 1), (2, 2), (2, 3),
(3, 1), (3, 2), (3, 3), (3, 4),
(4, 1), (4, 2),
(5, 1), (5, 2), (5, 5),
(6, 1), (6, 2), (6, 3), (6, 4),
(7, 1), (7, 2),
(8, 1), (8, 3),
(9, 1),
(10, 1), (10, 2);

-- =========================================================
-- CUSTOMERS
-- =========================================================
INSERT INTO customer (full_name, address, city, state, postal_code, country, id_type, id_number, registration_date, email, password_hash) VALUES
('Fdaa Alhalaki', '12 Main St', 'Ottawa', 'Ontario', 'K1K1K1', 'Canada', 'Passport', 'PA123456', '2026-01-10', 'fdaa.alhalaki@example.com', 'hashed_password_1'),
('John Smith', '45 Queen St', 'Toronto', 'Ontario', 'M5H2N2', 'Canada', 'Driver License', 'DL987654', '2026-01-15', 'john.smith@example.com', 'hashed_password_2'),
('Sara Ahmed', '77 Bank St', 'Ottawa', 'Ontario', 'K2P1X5', 'Canada', 'Passport', 'PA654321', '2026-02-01', 'sara.ahmed@example.com', 'hashed_password_3'),
('Lina Chen', '90 Pine Ave', 'Montreal', 'Quebec', 'H2X3Y7', 'Canada', 'Health Card', 'HC456789', '2026-02-12', 'lina.chen@example.com', 'hashed_password_4');

-- =========================================================
-- EMPLOYEES
-- =========================================================
INSERT INTO employee (hotel_id, full_name, address, city, state, postal_code, country, ssn_sin, email, password_hash) VALUES
(1, 'Alice Brown', '10 Elm St', 'Ottawa', 'Ontario', 'K1A1A1', 'Canada', 'SIN100001', 'alice.brown@example.com', 'hashed_password_1'),
(1, 'Mark Lee', '11 Elm St', 'Ottawa', 'Ontario', 'K1A1A2', 'Canada', 'SIN100002', 'mark.lee@example.com', 'hashed_password_2'),
(2, 'Emma Wilson', '20 King St', 'Toronto', 'Ontario', 'M5V1A1', 'Canada', 'SIN200001', 'emma.wilson@example.com', 'hashed_password_3'),
(3, 'David Clark', '30 Rideau St', 'Ottawa', 'Ontario', 'K1N2A2', 'Canada', 'SIN300001', 'david.clark@example.com', 'hashed_password_4'),
(4, 'Sophie Martin', '40 Peel St', 'Montreal', 'Quebec', 'H3B2A1', 'Canada', 'SIN400001', 'sophie.martin@example.com', 'hashed_password_5');

-- =========================================================
-- ROLES
-- =========================================================
INSERT INTO role (role_name) VALUES
('Manager'),
('Receptionist'),
('Housekeeping');

-- =========================================================
-- EMPLOYEE ROLES
-- =========================================================
INSERT INTO employee_role (employee_id, role_id) VALUES
(1, 1),
(2, 2),
(3, 1),
(4, 1),
(5, 1);

-- =========================================================
-- MANAGES
-- one manager per hotel
-- =========================================================
INSERT INTO manages (hotel_id, employee_id) VALUES
(1, 1),
(2, 3),
(3, 4),
(4, 5);

-- =========================================================
-- BOOKINGS
-- =========================================================
INSERT INTO booking (customer_id, room_id, start_date, end_date, created_at, status) VALUES
(1, 1, '2026-04-10', '2026-04-15', '2026-04-01 10:00:00', 'Active'),
(2, 5, '2026-04-12', '2026-04-16', '2026-04-01 11:00:00', 'Pending'),
(3, 8, '2026-04-20', '2026-04-25', '2026-04-01 12:00:00', 'Confirmed'),
(4, 10, '2026-04-08', '2026-04-11', '2026-04-01 13:00:00', 'Archived');

-- =========================================================
-- RENTINGS
-- =========================================================
INSERT INTO renting (customer_id, room_id, employee_id, checkin_date, checkout_date, status) VALUES
(1, 2, 2, '2026-04-02', '2026-04-05', 'Active'),
(2, 4, 3, '2026-04-01', '2026-04-03', 'Completed'),
(4, 9, 5, '2026-04-03', '2026-04-06', 'Active');

-- =========================================================
-- PAYMENTS
-- =========================================================
INSERT INTO payment (renting_id, amount, payment_date, method) VALUES
(1, 640.00, '2026-04-02 15:00:00', 'Credit_Card'),
(2, 550.00, '2026-04-01 12:00:00', 'Debit_Card'),
(3, 480.00, '2026-04-03 17:30:00', 'Cash');
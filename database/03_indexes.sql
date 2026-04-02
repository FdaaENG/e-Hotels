USE ehotels;

-- =========================================================
-- CUSTOMER
-- =========================================================
-- CREATE INDEX idx_customer_full_name ON customer(full_name);
CREATE INDEX idx_customer_city ON customer(city);
CREATE INDEX idx_customer_registration_date ON customer(registration_date);

-- =========================================================
-- HOTEL CHAIN
-- =========================================================
CREATE INDEX idx_hotel_chain_name ON hotel_chain(name);

-- =========================================================
-- HOTEL
-- =========================================================
CREATE INDEX idx_hotel_chain_id ON hotel(chain_id);
CREATE INDEX idx_hotel_city ON hotel(city);
CREATE INDEX idx_hotel_country ON hotel(country);
CREATE INDEX idx_hotel_star_category ON hotel(star_category);

-- =========================================================
-- ROOM
-- =========================================================
CREATE INDEX idx_room_hotel_id ON room(hotel_id);
CREATE INDEX idx_room_price ON room(price);
CREATE INDEX idx_room_capacity ON room(capacity);
CREATE INDEX idx_room_view_type ON room(view_type);

-- =========================================================
-- ROOM ISSUE
-- =========================================================
CREATE INDEX idx_room_issue_room_id ON room_issue(room_id);
CREATE INDEX idx_room_issue_status ON room_issue(status);
CREATE INDEX idx_room_issue_reported_at ON room_issue(reported_at);

-- =========================================================
-- EMPLOYEE
-- =========================================================
CREATE INDEX idx_employee_hotel_id ON employee(hotel_id);
CREATE INDEX idx_employee_full_name ON employee(full_name);
CREATE INDEX idx_employee_city ON employee(city);

-- =========================================================
-- EMPLOYEE ROLE (JOIN TABLE)
-- =========================================================
CREATE INDEX idx_employee_role_employee_id ON employee_role(employee_id);
CREATE INDEX idx_employee_role_role_id ON employee_role(role_id);

-- =========================================================
-- BOOKING
-- =========================================================
CREATE INDEX idx_booking_customer_id ON booking(customer_id);
CREATE INDEX idx_booking_room_id ON booking(room_id);
CREATE INDEX idx_booking_start_date ON booking(start_date);
CREATE INDEX idx_booking_end_date ON booking(end_date);
CREATE INDEX idx_booking_status ON booking(status);

-- =========================================================
-- RENTING
-- =========================================================
CREATE INDEX idx_renting_customer_id ON renting(customer_id);
CREATE INDEX idx_renting_room_id ON renting(room_id);
CREATE INDEX idx_renting_employee_id ON renting(employee_id);
CREATE INDEX idx_renting_checkin_date ON renting(checkin_date);
CREATE INDEX idx_renting_checkout_date ON renting(checkout_date);
CREATE INDEX idx_renting_status ON renting(status);

-- =========================================================
-- PAYMENT
-- =========================================================
CREATE INDEX idx_payment_renting_id ON payment(renting_id);
CREATE INDEX idx_payment_date ON payment(payment_date);
CREATE INDEX idx_payment_method ON payment(method);
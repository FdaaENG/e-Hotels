USE ehotels;

-- =========================
-- HOTEL CONSTRAINTS
-- =========================
ALTER TABLE hotel
ADD CONSTRAINT chk_hotel_star_category
CHECK (star_category BETWEEN 1 AND 5);

ALTER TABLE hotel
ADD CONSTRAINT chk_hotel_num_rooms
CHECK (num_rooms > 0);

-- =========================
-- ROOM CONSTRAINTS
-- =========================
ALTER TABLE room
ADD CONSTRAINT chk_room_price
CHECK (price > 0);

ALTER TABLE room
ADD CONSTRAINT chk_room_capacity
CHECK (capacity IN ('single', 'double', 'triple', 'suite'));

ALTER TABLE room
ADD CONSTRAINT chk_room_view_type
CHECK (view_type IN ('sea', 'mountain'));

-- =========================
-- CUSTOMER CONSTRAINTS
-- =========================
ALTER TABLE customer
ADD CONSTRAINT uq_customer_id_pair
UNIQUE (id_type, id_number);

-- registration_date <= CURRENT_DATE
-- moved to trigger because MySQL rejects this kind of time-based CHECK

-- =========================
-- EMPLOYEE CONSTRAINTS
-- =========================
ALTER TABLE employee
MODIFY ssn_sin VARCHAR(50) NOT NULL;

-- =========================
-- ROOM ISSUE CONSTRAINTS
-- =========================
ALTER TABLE room_issue
ADD CONSTRAINT chk_room_issue_status
CHECK (status IN ('open', 'fixed'));

ALTER TABLE room_issue
ADD CONSTRAINT chk_room_issue_resolved_at
CHECK (resolved_at IS NULL OR resolved_at >= reported_at);

-- reported_at <= CURRENT_TIMESTAMP
-- moved to trigger because it is time-based

-- =========================
-- BOOKING CONSTRAINTS
-- =========================
ALTER TABLE booking
ADD CONSTRAINT chk_booking_dates
CHECK (start_date < end_date);

ALTER TABLE booking
ADD CONSTRAINT chk_booking_status
CHECK (status IN ('active', 'cancelled', 'completed', 'archived'));

-- =========================
-- RENTING CONSTRAINTS
-- =========================
ALTER TABLE renting
ADD CONSTRAINT chk_renting_dates
CHECK (checkin_date < checkout_date);

ALTER TABLE renting
ADD CONSTRAINT chk_renting_status
CHECK (status IN ('active', 'cancelled', 'completed', 'archived'));

ALTER TABLE renting
MODIFY employee_id INT NOT NULL;

-- =========================
-- PAYMENT CONSTRAINTS
-- =========================
ALTER TABLE payment
ADD CONSTRAINT chk_payment_amount
CHECK (amount > 0);

ALTER TABLE payment
ADD CONSTRAINT chk_payment_method
CHECK (method IN ('cash', 'credit_card', 'debit_card', 'online'));

-- =========================
-- EMAIL / PHONE BASIC CONSTRAINTS
-- =========================
ALTER TABLE chain_email
ADD CONSTRAINT chk_chain_email_format
CHECK (email LIKE '%@%.%');

ALTER TABLE hotel_email
ADD CONSTRAINT chk_hotel_email_format
CHECK (email LIKE '%@%.%');

ALTER TABLE chain_phone
ADD CONSTRAINT chk_chain_phone_length
CHECK (CHAR_LENGTH(phone_number) >= 10);

ALTER TABLE hotel_phone
ADD CONSTRAINT chk_hotel_phone_length
CHECK (CHAR_LENGTH(phone_number) >= 10);

-- =========================
-- ARCHIVE BASIC CONSTRAINTS
-- =========================
ALTER TABLE booking_archive
ADD CONSTRAINT chk_booking_archive_dates
CHECK (start_date < end_date);

ALTER TABLE renting_archive
ADD CONSTRAINT chk_renting_archive_dates
CHECK (checkin_date < checkout_date);
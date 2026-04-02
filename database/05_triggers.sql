USE ehotels;

DELIMITER $$

-- =========================================================
-- 1. VALIDATE BOOKING DATES
-- start_date must be before end_date
-- =========================================================
DROP TRIGGER IF EXISTS trg_booking_validate_dates $$
CREATE TRIGGER trg_booking_validate_dates
BEFORE INSERT ON booking
FOR EACH ROW
BEGIN
    IF NEW.start_date >= NEW.end_date THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Booking start_date must be earlier than end_date';
    END IF;
END $$

DROP TRIGGER IF EXISTS trg_booking_validate_dates_update $$
CREATE TRIGGER trg_booking_validate_dates_update
BEFORE UPDATE ON booking
FOR EACH ROW
BEGIN
    IF NEW.start_date >= NEW.end_date THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Booking start_date must be earlier than end_date';
    END IF;
END $$

-- =========================================================
-- 2. VALIDATE RENTING DATES
-- checkin_date must be before checkout_date
-- =========================================================
DROP TRIGGER IF EXISTS trg_renting_validate_dates $$
CREATE TRIGGER trg_renting_validate_dates
BEFORE INSERT ON renting
FOR EACH ROW
BEGIN
    IF NEW.checkin_date >= NEW.checkout_date THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Renting checkin_date must be earlier than checkout_date';
    END IF;
END $$

DROP TRIGGER IF EXISTS trg_renting_validate_dates_update $$
CREATE TRIGGER trg_renting_validate_dates_update
BEFORE UPDATE ON renting
FOR EACH ROW
BEGIN
    IF NEW.checkin_date >= NEW.checkout_date THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Renting checkin_date must be earlier than checkout_date';
    END IF;
END $$

-- =========================================================
-- 3. VALIDATE PAYMENT AMOUNT
-- payment amount must be greater than 0
-- =========================================================
DROP TRIGGER IF EXISTS trg_payment_validate_amount $$
CREATE TRIGGER trg_payment_validate_amount
BEFORE INSERT ON payment
FOR EACH ROW
BEGIN
    IF NEW.amount <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Payment amount must be greater than 0';
    END IF;
END $$

DROP TRIGGER IF EXISTS trg_payment_validate_amount_update $$
CREATE TRIGGER trg_payment_validate_amount_update
BEFORE UPDATE ON payment
FOR EACH ROW
BEGIN
    IF NEW.amount <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Payment amount must be greater than 0';
    END IF;
END $$

-- =========================================================
-- 4. AUTO-UPDATE HOTEL CHAIN HOTEL COUNT AFTER INSERT
-- =========================================================
DROP TRIGGER IF EXISTS trg_hotel_after_insert_update_chain_count $$
CREATE TRIGGER trg_hotel_after_insert_update_chain_count
AFTER INSERT ON hotel
FOR EACH ROW
BEGIN
    UPDATE hotel_chain
    SET num_hotels = (
        SELECT COUNT(*)
        FROM hotel
        WHERE chain_id = NEW.chain_id
    )
    WHERE chain_id = NEW.chain_id;
END $$

-- =========================================================
-- 5. AUTO-UPDATE HOTEL CHAIN HOTEL COUNT AFTER DELETE
-- =========================================================
DROP TRIGGER IF EXISTS trg_hotel_after_delete_update_chain_count $$
CREATE TRIGGER trg_hotel_after_delete_update_chain_count
AFTER DELETE ON hotel
FOR EACH ROW
BEGIN
    UPDATE hotel_chain
    SET num_hotels = (
        SELECT COUNT(*)
        FROM hotel
        WHERE chain_id = OLD.chain_id
    )
    WHERE chain_id = OLD.chain_id;
END $$

-- =========================================================
-- 6. AUTO-UPDATE HOTEL CHAIN HOTEL COUNT AFTER UPDATE
-- Handles hotel moving from one chain to another
-- =========================================================
DROP TRIGGER IF EXISTS trg_hotel_after_update_update_chain_count $$
CREATE TRIGGER trg_hotel_after_update_update_chain_count
AFTER UPDATE ON hotel
FOR EACH ROW
BEGIN
    IF OLD.chain_id <> NEW.chain_id THEN
        UPDATE hotel_chain
        SET num_hotels = (
            SELECT COUNT(*)
            FROM hotel
            WHERE chain_id = OLD.chain_id
        )
        WHERE chain_id = OLD.chain_id;

        UPDATE hotel_chain
        SET num_hotels = (
            SELECT COUNT(*)
            FROM hotel
            WHERE chain_id = NEW.chain_id
        )
        WHERE chain_id = NEW.chain_id;
    END IF;
END $$

-- =========================================================
-- 7. ARCHIVE BOOKING BEFORE DELETE
-- Save booking info before it is removed
-- =========================================================
DROP TRIGGER IF EXISTS trg_booking_before_delete_archive $$
CREATE TRIGGER trg_booking_before_delete_archive
BEFORE DELETE ON booking
FOR EACH ROW
BEGIN
    INSERT INTO booking_archive (
        original_booking_id,
        customer_id_value,
        customer_name,
        customer_address,
        hotel_name,
        room_id_value,
        capacity,
        price,
        view_type,
        start_date,
        end_date,
        archived_at
    )
    SELECT
        OLD.booking_id,
        c.customer_id,
        c.full_name,
        c.address,
        h.name,
        r.room_id,
        r.capacity,
        r.price,
        r.view_type,
        OLD.start_date,
        OLD.end_date,
        NOW()
    FROM room r
    LEFT JOIN hotel h ON r.hotel_id = h.hotel_id
    LEFT JOIN customer c ON c.customer_id = OLD.customer_id
    WHERE r.room_id = OLD.room_id;
END $$

-- =========================================================
-- 8. ARCHIVE RENTING BEFORE DELETE
-- Save renting info before it is removed
-- =========================================================
DROP TRIGGER IF EXISTS trg_renting_before_delete_archive $$
CREATE TRIGGER trg_renting_before_delete_archive
BEFORE DELETE ON renting
FOR EACH ROW
BEGIN
    INSERT INTO renting_archive (
        original_renting_id,
        customer_id_value,
        customer_name,
        customer_address,
        room_id_value,
        capacity,
        price,
        view_type,
        hotel_name,
        hotel_address,
        checkin_date,
        checkout_date,
        employee_id_value,
        archived_at
    )
    SELECT
        OLD.renting_id,
        c.customer_id,
        c.full_name,
        c.address,
        r.room_id,
        r.capacity,
        r.price,
        r.view_type,
        h.name,
        h.address,
        OLD.checkin_date,
        OLD.checkout_date,
        OLD.employee_id,
        NOW()
    FROM room r
    LEFT JOIN hotel h ON r.hotel_id = h.hotel_id
    LEFT JOIN customer c ON c.customer_id = OLD.customer_id
    WHERE r.room_id = OLD.room_id;
END $$

DELIMITER ;
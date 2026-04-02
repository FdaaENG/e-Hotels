USE ehotels;

-- =========================================================
-- 1. AVAILABLE ROOMS VIEW
-- Shows rooms with hotel info
-- =========================================================
CREATE OR REPLACE VIEW available_rooms_view AS
SELECT
    r.room_id,
    h.hotel_id,
    h.name AS hotel_name,
    h.city,
    h.country,
    h.star_category,
    r.price,
    r.capacity,
    r.view_type,
    r.is_extendable
FROM room r
JOIN hotel h ON r.hotel_id = h.hotel_id
WHERE r.room_id NOT IN (
    SELECT b.room_id
    FROM booking b
    WHERE b.status IN ('confirmed', 'active')
)
AND r.room_id NOT IN (
    SELECT rt.room_id
    FROM renting rt
    WHERE rt.status IN ('checked-in', 'active')
);

-- =========================================================
-- 2. HOTEL ROOM CAPACITY VIEW
-- Number of rooms per hotel
-- =========================================================
CREATE OR REPLACE VIEW hotel_room_count_view AS
SELECT
    h.hotel_id,
    h.name AS hotel_name,
    h.city,
    h.country,
    COUNT(r.room_id) AS total_rooms
FROM hotel h
LEFT JOIN room r ON h.hotel_id = r.hotel_id
GROUP BY h.hotel_id, h.name, h.city, h.country;

-- =========================================================
-- 3. HOTEL AVAILABLE ROOM COUNT VIEW
-- Shows how many rooms are currently available in each hotel
-- =========================================================
CREATE OR REPLACE VIEW hotel_available_room_count_view AS
SELECT
    h.hotel_id,
    h.name AS hotel_name,
    h.city,
    h.country,
    COUNT(r.room_id) AS available_rooms
FROM hotel h
LEFT JOIN room r ON h.hotel_id = r.hotel_id
WHERE r.room_id NOT IN (
    SELECT b.room_id
    FROM booking b
    WHERE b.status IN ('confirmed', 'active')
)
AND r.room_id NOT IN (
    SELECT rt.room_id
    FROM renting rt
    WHERE rt.status IN ('checked-in', 'active')
)
GROUP BY h.hotel_id, h.name, h.city, h.country;

-- =========================================================
-- 4. CUSTOMER BOOKINGS VIEW
-- Shows booking details with customer and room info
-- =========================================================
CREATE OR REPLACE VIEW customer_bookings_view AS
SELECT
    b.booking_id,
    c.customer_id,
    c.full_name AS customer_name,
    h.name AS hotel_name,
    h.city,
    r.room_id,
    r.capacity,
    r.view_type,
    r.price,
    b.start_date,
    b.end_date,
    b.status
FROM booking b
LEFT JOIN customer c ON b.customer_id = c.customer_id
LEFT JOIN room r ON b.room_id = r.room_id
LEFT JOIN hotel h ON r.hotel_id = h.hotel_id;

-- =========================================================
-- 5. CUSTOMER RENTINGS VIEW
-- Shows renting details with customer, employee, room, and hotel
-- =========================================================
CREATE OR REPLACE VIEW customer_rentings_view AS
SELECT
    rt.renting_id,
    c.customer_id,
    c.full_name AS customer_name,
    e.employee_id,
    e.full_name AS employee_name,
    h.name AS hotel_name,
    h.city,
    r.room_id,
    r.capacity,
    r.view_type,
    r.price,
    rt.checkin_date,
    rt.checkout_date,
    rt.status
FROM renting rt
LEFT JOIN customer c ON rt.customer_id = c.customer_id
LEFT JOIN employee e ON rt.employee_id = e.employee_id
LEFT JOIN room r ON rt.room_id = r.room_id
LEFT JOIN hotel h ON r.hotel_id = h.hotel_id;

-- =========================================================
-- 6. HOTEL EMPLOYEES VIEW
-- Shows employees working in each hotel
-- =========================================================
CREATE OR REPLACE VIEW hotel_employees_view AS
SELECT
    e.employee_id,
    e.full_name AS employee_name,
    h.hotel_id,
    h.name AS hotel_name,
    h.city,
    h.country
FROM employee e
JOIN hotel h ON e.hotel_id = h.hotel_id;

-- =========================================================
-- 7. HOTEL MANAGERS VIEW
-- Shows each hotel manager
-- =========================================================
CREATE OR REPLACE VIEW hotel_managers_view AS
SELECT
    h.hotel_id,
    h.name AS hotel_name,
    h.city,
    h.country,
    e.employee_id,
    e.full_name AS manager_name
FROM manages m
JOIN hotel h ON m.hotel_id = h.hotel_id
JOIN employee e ON m.employee_id = e.employee_id;

-- =========================================================
-- 8. ROOM ISSUES VIEW
-- Shows reported issues with room and hotel info
-- =========================================================
CREATE OR REPLACE VIEW room_issues_view AS
SELECT
    ri.issue_id,
    ri.room_id,
    h.name AS hotel_name,
    h.city,
    ri.type,
    ri.description,
    ri.status,
    ri.reported_at,
    ri.resolved_at
FROM room_issue ri
JOIN room r ON ri.room_id = r.room_id
JOIN hotel h ON r.hotel_id = h.hotel_id;

-- =========================================================
-- 9. PAYMENT DETAILS VIEW
-- Shows payment with renting and customer info
-- =========================================================
CREATE OR REPLACE VIEW payment_details_view AS
SELECT
    p.payment_id,
    p.amount,
    p.payment_date,
    p.method,
    rt.renting_id,
    c.customer_id,
    c.full_name AS customer_name,
    h.name AS hotel_name
FROM payment p
JOIN renting rt ON p.renting_id = rt.renting_id
LEFT JOIN customer c ON rt.customer_id = c.customer_id
LEFT JOIN room r ON rt.room_id = r.room_id
LEFT JOIN hotel h ON r.hotel_id = h.hotel_id;

-- =========================================================
-- 10. HOTEL_CHAIN_HOTELS VIEW
-- Shows hotels grouped with their chain
-- =========================================================
CREATE OR REPLACE VIEW hotel_chain_hotels_view AS
SELECT
    hc.chain_id,
    hc.name AS chain_name,
    h.hotel_id,
    h.name AS hotel_name,
    h.city,
    h.country,
    h.star_category,
    h.num_rooms
FROM hotel_chain hc
JOIN hotel h ON hc.chain_id = h.chain_id;
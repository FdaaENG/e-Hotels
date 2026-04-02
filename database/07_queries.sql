USE ehotels;

-- =========================================================
-- 1. List all hotels with their chain name
-- =========================================================
SELECT
    h.hotel_id,
    h.name AS hotel_name,
    hc.name AS chain_name,
    h.city,
    h.country,
    h.star_category,
    h.num_rooms
FROM hotel h
JOIN hotel_chain hc ON h.chain_id = hc.chain_id;

-- =========================================================
-- 2. Find all rooms in a specific city with hotel info
-- Example: Ottawa
-- =========================================================
SELECT
    r.room_id,
    h.name AS hotel_name,
    h.city,
    r.price,
    r.capacity,
    r.view_type,
    r.is_extendable
FROM room r
JOIN hotel h ON r.hotel_id = h.hotel_id
WHERE h.city = 'Ottawa';

-- =========================================================
-- 3. Find all available rooms
-- Excludes rooms with active/confirmed booking or active renting
-- =========================================================
SELECT
    r.room_id,
    h.name AS hotel_name,
    h.city,
    r.price,
    r.capacity,
    r.view_type
FROM room r
JOIN hotel h ON r.hotel_id = h.hotel_id
WHERE r.room_id NOT IN (
    SELECT b.room_id
    FROM booking b
    WHERE b.status IN ('Confirmed')
)
AND r.room_id NOT IN (
    SELECT rt.room_id
    FROM renting rt
    WHERE rt.status IN ('Active')
);

-- =========================================================
-- 4. Show all bookings with customer and hotel details
-- =========================================================
SELECT
    b.booking_id,
    c.full_name AS customer_name,
    h.name AS hotel_name,
    r.room_id,
    b.start_date,
    b.end_date,
    b.status
FROM booking b
LEFT JOIN customer c ON b.customer_id = c.customer_id
LEFT JOIN room r ON b.room_id = r.room_id
LEFT JOIN hotel h ON r.hotel_id = h.hotel_id;

-- =========================================================
-- 5. Show all rentings with customer and employee details
-- =========================================================
SELECT
    rt.renting_id,
    c.full_name AS customer_name,
    e.full_name AS employee_name,
    h.name AS hotel_name,
    rt.checkin_date,
    rt.checkout_date,
    rt.status
FROM renting rt
LEFT JOIN customer c ON rt.customer_id = c.customer_id
LEFT JOIN employee e ON rt.employee_id = e.employee_id
LEFT JOIN room r ON rt.room_id = r.room_id
LEFT JOIN hotel h ON r.hotel_id = h.hotel_id;

-- =========================================================
-- 6. Total number of hotels per chain
-- =========================================================
SELECT
    hc.chain_id,
    hc.name AS chain_name,
    COUNT(h.hotel_id) AS total_hotels
FROM hotel_chain hc
LEFT JOIN hotel h ON hc.chain_id = h.chain_id
GROUP BY hc.chain_id, hc.name;

-- =========================================================
-- 7. Total number of rooms per hotel
-- =========================================================
SELECT
    h.hotel_id,
    h.name AS hotel_name,
    COUNT(r.room_id) AS total_rooms
FROM hotel h
LEFT JOIN room r ON h.hotel_id = r.hotel_id
GROUP BY h.hotel_id, h.name;

-- =========================================================
-- 8. Average room price per hotel
-- =========================================================
SELECT
    h.hotel_id,
    h.name AS hotel_name,
    AVG(r.price) AS average_room_price
FROM hotel h
JOIN room r ON h.hotel_id = r.hotel_id
GROUP BY h.hotel_id, h.name;

-- =========================================================
-- 9. Find the most expensive room
-- =========================================================
SELECT
    r.room_id,
    h.name AS hotel_name,
    h.city,
    r.price,
    r.capacity,
    r.view_type
FROM room r
JOIN hotel h ON r.hotel_id = h.hotel_id
WHERE r.price = (
    SELECT MAX(price)
    FROM room
);

-- =========================================================
-- 10. List customers who made bookings
-- =========================================================
SELECT DISTINCT
    c.customer_id,
    c.full_name,
    c.city,
    c.country
FROM customer c
JOIN booking b ON c.customer_id = b.customer_id;

-- =========================================================
-- 11. List employees and their roles
-- =========================================================
SELECT
    e.employee_id,
    e.full_name AS employee_name,
    r.role_name,
    h.name AS hotel_name
FROM employee e
JOIN employee_role er ON e.employee_id = er.employee_id
JOIN role r ON er.role_id = r.role_id
JOIN hotel h ON e.hotel_id = h.hotel_id;

-- =========================================================
-- 12. Find the manager of each hotel
-- =========================================================
SELECT
    h.hotel_id,
    h.name AS hotel_name,
    e.employee_id,
    e.full_name AS manager_name
FROM manages m
JOIN hotel h ON m.hotel_id = h.hotel_id
JOIN employee e ON m.employee_id = e.employee_id;

-- =========================================================
-- 13. Show all room issues with hotel information
-- =========================================================
SELECT
    ri.issue_id,
    h.name AS hotel_name,
    ri.room_id,
    ri.type,
    ri.status,
    ri.reported_at,
    ri.resolved_at
FROM room_issue ri
JOIN room r ON ri.room_id = r.room_id
JOIN hotel h ON r.hotel_id = h.hotel_id;

-- =========================================================
-- 14. Count open room issues per hotel
-- =========================================================
SELECT
    h.hotel_id,
    h.name AS hotel_name,
    COUNT(ri.issue_id) AS open_issues
FROM hotel h
JOIN room r ON h.hotel_id = r.hotel_id
JOIN room_issue ri ON r.room_id = ri.room_id
WHERE ri.status = 'Open'
GROUP BY h.hotel_id, h.name;

-- =========================================================
-- 15. Show payment details with customer and hotel info
-- =========================================================
SELECT
    p.payment_id,
    c.full_name AS customer_name,
    h.name AS hotel_name,
    p.amount,
    p.method,
    p.payment_date
FROM payment p
JOIN renting rt ON p.renting_id = rt.renting_id
LEFT JOIN customer c ON rt.customer_id = c.customer_id
LEFT JOIN room r ON rt.room_id = r.room_id
LEFT JOIN hotel h ON r.hotel_id = h.hotel_id;

-- =========================================================
-- 16. Total revenue generated by each hotel
-- =========================================================
SELECT
    h.hotel_id,
    h.name AS hotel_name,
    SUM(p.amount) AS total_revenue
FROM payment p
JOIN renting rt ON p.renting_id = rt.renting_id
JOIN room r ON rt.room_id = r.room_id
JOIN hotel h ON r.hotel_id = h.hotel_id
GROUP BY h.hotel_id, h.name;

-- =========================================================
-- 17. Find hotels with more than 2 rooms
-- =========================================================
SELECT
    h.hotel_id,
    h.name AS hotel_name,
    COUNT(r.room_id) AS total_rooms
FROM hotel h
JOIN room r ON h.hotel_id = r.hotel_id
GROUP BY h.hotel_id, h.name
HAVING COUNT(r.room_id) > 2;

-- =========================================================
-- 18. Show all amenities for each room
-- =========================================================
SELECT
    r.room_id,
    h.name AS hotel_name,
    a.amenity_name
FROM room_amenity ra
JOIN room r ON ra.room_id = r.room_id
JOIN amenity a ON ra.amenity_id = a.amenity_id
JOIN hotel h ON r.hotel_id = h.hotel_id
ORDER BY r.room_id, a.amenity_name;

-- =========================================================
-- 19. Find customers who have both bookings and rentings
-- =========================================================
SELECT
    c.customer_id,
    c.full_name
FROM customer c
WHERE c.customer_id IN (
    SELECT customer_id FROM booking WHERE customer_id IS NOT NULL
)
AND c.customer_id IN (
    SELECT customer_id FROM renting WHERE customer_id IS NOT NULL
);

-- =========================================================
-- 20. Find hotels in the same city as a given customer
-- Example based on matching city
-- =========================================================
SELECT
    c.full_name AS customer_name,
    h.name AS hotel_name,
    h.city
FROM customer c
JOIN hotel h ON c.city = h.city
ORDER BY c.full_name, h.name;
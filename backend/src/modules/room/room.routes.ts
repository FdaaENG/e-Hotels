import express from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../../config/db.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const { startDate, endDate, city, capacity, chain, starCategory, maxPrice } = req.query;

    // Validate dates if both provided
    if (startDate && endDate && String(startDate) >= String(endDate)) {
      return res.status(400).json({ message: "startDate must be earlier than endDate" });
    }

    let query = `
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
      JOIN hotel_chain hc ON h.chain_id = hc.chain_id
      WHERE r.room_id NOT IN (
        SELECT b.room_id
        FROM booking b
        WHERE b.room_id IS NOT NULL
          AND b.status = 'active'
          ${startDate && endDate ? `AND NOT (b.end_date <= ? OR b.start_date >= ?)` : ""}
      )
      AND r.room_id NOT IN (
        SELECT rt.room_id
        FROM renting rt
        WHERE rt.room_id IS NOT NULL
          AND rt.status = 'active'
          ${startDate && endDate ? `AND NOT (rt.checkout_date <= ? OR rt.checkin_date >= ?)` : ""}
      )
    `;

    const params: (string | number)[] = [];

    // Inject date params for the two subqueries
    if (startDate && endDate) {
      params.push(String(startDate), String(endDate)); // booking subquery
      params.push(String(startDate), String(endDate)); // renting subquery
    }

    if (city) {
      query += ` AND h.city = ?`;
      params.push(String(city));
    }
    if (capacity) {
      query += ` AND r.capacity = ?`;
      params.push(String(capacity));
    }
    if (chain) {
      query += ` AND hc.name = ?`;
      params.push(String(chain));
    }
    if (starCategory) {
      query += ` AND h.star_category = ?`;
      params.push(Number(starCategory));
    }
    if (maxPrice) {
      query += ` AND r.price <= ?`;
      params.push(Number(maxPrice));
    }

    query += ` ORDER BY h.name, r.price ASC`;

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Room search error:", error);
    res.status(500).json({ message: "Failed to fetch available rooms" });
  }
});

router.patch("/cancel/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ message: "Customer ID is required" });
    }

    // Make sure the booking belongs to this customer and is still active
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT booking_id FROM booking 
       WHERE booking_id = ? AND customer_id = ? AND status = 'active'`,
      [Number(bookingId), Number(customerId)]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Active booking not found for this customer" });
    }

    await pool.query(
      `UPDATE booking SET status = 'cancelled' WHERE booking_id = ?`,
      [Number(bookingId)]
    );

    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
});

router.post("/book", async (req, res) => {
  try {
    const { customerId, roomId, startDate, endDate } = req.body;

    if (!customerId || !roomId || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required booking data" });
    }

    if (startDate >= endDate) {
      return res
        .status(400)
        .json({ message: "Start date must be earlier than end date" });
    }

    const conflictQuery = `
      SELECT 1
      FROM booking
      WHERE room_id = ?
        AND status = 'active'
        AND NOT (end_date <= ? OR start_date >= ?)
      UNION
      SELECT 1
      FROM renting
      WHERE room_id = ?
        AND status = 'active'
        AND NOT (checkout_date <= ? OR checkin_date >= ?)
      LIMIT 1
    `;

    const [conflicts] = await pool.query<RowDataPacket[]>(conflictQuery, [
      Number(roomId),
      startDate,
      endDate,
      Number(roomId),
      startDate,
      endDate,
    ]);

    if (conflicts.length > 0) {
      return res.status(409).json({
        message: "This room is not available for the selected dates",
      });
    }

    const insertQuery = `
      INSERT INTO booking (customer_id, room_id, start_date, end_date, status)
      VALUES (?, ?, ?, ?, 'active')
    `;

    const [result] = await pool.query<ResultSetHeader>(insertQuery, [
      Number(customerId),
      Number(roomId),
      startDate,
      endDate,
    ]);

    res.status(201).json({
      message: "Booking created successfully",
      bookingId: result.insertId,
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ message: "Failed to create booking" });
  }
});

router.get("/my-bookings/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;

    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT
        b.booking_id AS id,
        'booking' AS record_type,
        h.name AS hotel_name,
        h.city,
        r.room_id,
        r.capacity,
        r.view_type,
        r.price,
        b.start_date AS start_date,
        b.end_date AS end_date,
        b.status
      FROM booking b
      JOIN room r ON b.room_id = r.room_id
      JOIN hotel h ON r.hotel_id = h.hotel_id
      WHERE b.customer_id = ?
        AND b.status = 'active'

      UNION ALL

      SELECT
        rt.renting_id AS id,
        'renting' AS record_type,
        h.name AS hotel_name,
        h.city,
        r.room_id,
        r.capacity,
        r.view_type,
        r.price,
        rt.checkin_date AS start_date,
        rt.checkout_date AS end_date,
        'renting' AS status
      FROM renting rt
      JOIN room r ON rt.room_id = r.room_id
      JOIN hotel h ON r.hotel_id = h.hotel_id
      WHERE rt.customer_id = ?
        AND rt.status = 'active'

      ORDER BY start_date DESC
    `, [Number(customerId), Number(customerId)]);

    res.json(rows);
  } catch (error) {
    console.error("Fetch bookings error:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

router.get("/cities", async (_req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT DISTINCT city FROM hotel ORDER BY city ASC`
    );
    res.json(rows.map((r) => r.city));
  } catch (error) {
    console.error("Fetch cities error:", error);
    res.status(500).json({ message: "Failed to fetch cities" });
  }
});

router.get("/chains", async (_req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT chain_id, name FROM hotel_chain ORDER BY name ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error("Fetch chains error:", error);
    res.status(500).json({ message: "Failed to fetch chains" });
  }
});

// Get all active bookings (for employee to see pending check-ins)
router.get("/active-bookings", async (_req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT
        b.booking_id,
        b.customer_id,
        c.full_name AS customer_name,
        h.name AS hotel_name,
        h.city,
        r.room_id,
        r.capacity,
        r.view_type,
        r.price,
        b.start_date,
        b.end_date
      FROM booking b
      JOIN customer c ON b.customer_id = c.customer_id
      JOIN room r ON b.room_id = r.room_id
      JOIN hotel h ON r.hotel_id = h.hotel_id
      WHERE b.status = 'active'
      ORDER BY b.start_date ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Fetch active bookings error:", error);
    res.status(500).json({ message: "Failed to fetch active bookings" });
  }
});

// Convert a booking to a renting (check-in)
router.post("/checkin/:bookingId", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { bookingId } = req.params;
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    // Verify booking exists and is active
    const [bookings] = await connection.query<RowDataPacket[]>(
      `SELECT * FROM booking WHERE booking_id = ? AND status = 'active'`,
      [Number(bookingId)]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: "Active booking not found" });
    }

    const booking = bookings[0];

    await connection.beginTransaction();

    // Create the renting from the booking data
    await connection.query(
      `INSERT INTO renting (customer_id, room_id, employee_id, checkin_date, checkout_date, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [booking.customer_id, booking.room_id, Number(employeeId), booking.start_date, booking.end_date]
    );

    // Mark booking as completed
    await connection.query(
      `UPDATE booking SET status = 'completed' WHERE booking_id = ?`,
      [Number(bookingId)]
    );

    await connection.commit();

    res.status(201).json({ message: "Check-in successful, renting created" });
  } catch (error) {
    await connection.rollback();
    console.error("Check-in error:", error);
    res.status(500).json({ message: "Failed to process check-in" });
  } finally {
    connection.release();
  }
});

// Get all customers (for employee to select walk-in customer)
router.get("/customers", async (_req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT customer_id, full_name, email FROM customer ORDER BY full_name ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error("Fetch customers error:", error);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
});

// Direct walk-in renting (no prior booking)
router.post("/rent", async (req, res) => {
  try {
    const { customerId, roomId, checkinDate, checkoutDate, employeeId } = req.body;

    if (!customerId || !roomId || !checkinDate || !checkoutDate || !employeeId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (checkinDate >= checkoutDate) {
      return res.status(400).json({ message: "Check-in date must be before check-out date" });
    }

    // Check for conflicts
    const [conflicts] = await pool.query<RowDataPacket[]>(`
      SELECT 1
      FROM booking
      WHERE room_id = ?
        AND status = 'active'
        AND NOT (end_date <= ? OR start_date >= ?)
      UNION
      SELECT 1
      FROM renting
      WHERE room_id = ?
        AND status = 'active'
        AND NOT (checkout_date <= ? OR checkin_date >= ?)
      LIMIT 1
    `, [
      Number(roomId), checkinDate, checkoutDate,
      Number(roomId), checkinDate, checkoutDate,
    ]);

    if (conflicts.length > 0) {
      return res.status(409).json({ message: "Room is not available for the selected dates" });
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO renting (customer_id, room_id, employee_id, checkin_date, checkout_date, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [Number(customerId), Number(roomId), Number(employeeId), checkinDate, checkoutDate]
    );

    res.status(201).json({
      message: "Walk-in renting created successfully",
      rentingId: result.insertId,
    });
  } catch (error) {
    console.error("Walk-in renting error:", error);
    res.status(500).json({ message: "Failed to create renting" });
  }
});
// Get active rentings for employee's hotel
router.get("/active-rentings", async (_req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT
        rt.renting_id,
        c.full_name AS customer_name,
        h.name AS hotel_name,
        h.city,
        r.room_id,
        r.capacity,
        r.price,
        rt.checkin_date,
        rt.checkout_date,
        rt.status,
        DATEDIFF(rt.checkout_date, rt.checkin_date) * r.price AS total_amount
      FROM renting rt
      JOIN customer c ON rt.customer_id = c.customer_id
      JOIN room r ON rt.room_id = r.room_id
      JOIN hotel h ON r.hotel_id = h.hotel_id
      WHERE rt.status = 'active'
      ORDER BY rt.checkin_date ASC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Fetch active rentings error:", error);
    res.status(500).json({ message: "Failed to fetch active rentings" });
  }
});
// Record a payment for a renting
router.post("/payment", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { rentingId, amount, method } = req.body;

    if (!rentingId || !amount || !method) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const [rentings] = await connection.query<RowDataPacket[]>(
      `SELECT renting_id FROM renting WHERE renting_id = ? AND status = 'active'`,
      [Number(rentingId)]
    );

    if (rentings.length === 0) {
      return res.status(404).json({ message: "Active renting not found" });
    }

    await connection.beginTransaction();

    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO payment (renting_id, amount, method) VALUES (?, ?, ?)`,
      [Number(rentingId), Number(amount), method]
    );

    // Mark renting as completed after payment
    await connection.query(
      `UPDATE renting SET status = 'completed' WHERE renting_id = ?`,
      [Number(rentingId)]
    );

    await connection.commit();

    res.status(201).json({
      message: "Payment recorded successfully",
      paymentId: result.insertId,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Payment error:", error);
    res.status(500).json({ message: "Failed to record payment" });
  } finally {
    connection.release();
  }
});
export default router;
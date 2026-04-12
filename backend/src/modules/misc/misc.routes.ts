import express from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../../config/db.js";


const router = express.Router();

router.get("/roles", async (_req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT role_id, role_name FROM role ORDER BY role_name ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error("Fetch roles error:", error);
    res.status(500).json({ message: "Failed to fetch roles" });
  }
});
// Get all hotels
router.get("/hotels", async (_req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT h.hotel_id, h.chain_id, hc.name AS chain_name, h.name, h.address, h.city, 
              h.state, h.postal_code, h.country, h.star_category, h.num_rooms
       FROM hotel h
       JOIN hotel_chain hc ON h.chain_id = hc.chain_id
       ORDER BY h.name ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error("Fetch hotels error:", error);
    res.status(500).json({ message: "Failed to fetch hotels" });
  }
});

// Add a hotel
router.post("/hotels", async (req, res) => {
  try {
    const { chain_id, name, address, city, state, postal_code, country, star_category, num_rooms } = req.body;

    if (!chain_id || !name || !address || !city || !country || !star_category || !num_rooms) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO hotel (chain_id, name, address, city, state, postal_code, country, star_category, num_rooms)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [Number(chain_id), name, address, city, state || null, postal_code || null, country, Number(star_category), Number(num_rooms)]
    );

    res.status(201).json({ message: "Hotel added successfully", hotelId: result.insertId });
  } catch (error) {
    console.error("Add hotel error:", error);
    res.status(500).json({ message: "Failed to add hotel" });
  }
});

// Update a hotel
router.put("/hotels/:hotelId", async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { name, address, city, state, postal_code, country, star_category, num_rooms } = req.body;

    await pool.query(
      `UPDATE hotel SET name=?, address=?, city=?, state=?, postal_code=?, country=?, star_category=?, num_rooms=?
       WHERE hotel_id=?`,
      [name, address, city, state || null, postal_code || null, country, Number(star_category), Number(num_rooms), Number(hotelId)]
    );

    res.json({ message: "Hotel updated successfully" });
  } catch (error) {
    console.error("Update hotel error:", error);
    res.status(500).json({ message: "Failed to update hotel" });
  }
});

// Delete a hotel
router.delete("/hotels/:hotelId", async (req, res) => {
  try {
    const { hotelId } = req.params;

    await pool.query(
      `DELETE FROM hotel WHERE hotel_id = ?`,
      [Number(hotelId)]
    );

    res.json({ message: "Hotel deleted successfully" });
  } catch (error) {
    console.error("Delete hotel error:", error);
    res.status(500).json({ message: "Failed to delete hotel" });
  }
});

// Get all rooms
router.get("/rooms", async (_req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.room_id, r.hotel_id, h.name AS hotel_name, r.price, r.capacity, 
              r.view_type, r.is_extendable
       FROM room r
       JOIN hotel h ON r.hotel_id = h.hotel_id
       ORDER BY h.name, r.room_id ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error("Fetch rooms error:", error);
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
});

// Add a room
router.post("/rooms", async (req, res) => {
  try {
    const { hotel_id, price, capacity, view_type, is_extendable } = req.body;

    if (!hotel_id || !price || !capacity || !view_type) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO room (hotel_id, price, capacity, view_type, is_extendable)
       VALUES (?, ?, ?, ?, ?)`,
      [Number(hotel_id), Number(price), capacity, view_type, is_extendable ? 1 : 0]
    );

    res.status(201).json({ message: "Room added successfully", roomId: result.insertId });
  } catch (error) {
    console.error("Add room error:", error);
    res.status(500).json({ message: "Failed to add room" });
  }
});

// Update a room
router.put("/rooms/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const { price, capacity, view_type, is_extendable } = req.body;

    await pool.query(
      `UPDATE room SET price=?, capacity=?, view_type=?, is_extendable=?
       WHERE room_id=?`,
      [Number(price), capacity, view_type, is_extendable ? 1 : 0, Number(roomId)]
    );

    res.json({ message: "Room updated successfully" });
  } catch (error) {
    console.error("Update room error:", error);
    res.status(500).json({ message: "Failed to update room" });
  }
});
// Delete a room
router.delete("/rooms/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;

    await pool.query(
      `DELETE FROM room WHERE room_id = ?`,
      [Number(roomId)]
    );

    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Delete room error:", error);
    res.status(500).json({ message: "Failed to delete room" });
  }
});

// Get all customers
router.get("/customers", async (_req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT customer_id, full_name, email, address, city, state, postal_code, country, id_type, id_number, registration_date
       FROM customer
       ORDER BY full_name ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error("Fetch customers error:", error);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
});

// Update a customer
router.put("/customers/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    const { full_name, address, city, state, postal_code, country, id_type, id_number } = req.body;

    await pool.query(
      `UPDATE customer SET full_name=?, address=?, city=?, state=?, postal_code=?, country=?, id_type=?, id_number=?
       WHERE customer_id=?`,
      [full_name, address, city, state || null, postal_code || null, country, id_type, id_number, Number(customerId)]
    );

    res.json({ message: "Customer updated successfully" });
  } catch (error) {
    console.error("Update customer error:", error);
    res.status(500).json({ message: "Failed to update customer" });
  }
});

// Delete a customer
router.delete("/customers/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;

    await pool.query(
      `DELETE FROM customer WHERE customer_id = ?`,
      [Number(customerId)]
    );

    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Delete customer error:", error);
    res.status(500).json({ message: "Failed to delete customer" });
  }
});

// Get all employees
router.get("/employees", async (_req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT e.employee_id, e.hotel_id, h.name AS hotel_name, e.full_name, e.email, 
              e.address, e.city, e.state, e.postal_code, e.country, e.ssn_sin,
              GROUP_CONCAT(r.role_name SEPARATOR ', ') AS roles
       FROM employee e
       JOIN hotel h ON e.hotel_id = h.hotel_id
       LEFT JOIN employee_role er ON e.employee_id = er.employee_id
       LEFT JOIN role r ON er.role_id = r.role_id
       GROUP BY e.employee_id
       ORDER BY e.full_name ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error("Fetch employees error:", error);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
});

// Update an employee
router.put("/employees/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { full_name, address, city, state, postal_code, country, hotel_id } = req.body;

    await pool.query(
      `UPDATE employee SET full_name=?, address=?, city=?, state=?, postal_code=?, country=?, hotel_id=?
       WHERE employee_id=?`,
      [full_name, address, city, state || null, postal_code || null, country, Number(hotel_id), Number(employeeId)]
    );

    res.json({ message: "Employee updated successfully" });
  } catch (error) {
    console.error("Update employee error:", error);
    res.status(500).json({ message: "Failed to update employee" });
  }
});

// Delete an employee
router.delete("/employees/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;

    await pool.query(
      `DELETE FROM employee WHERE employee_id = ?`,
      [Number(employeeId)]
    );

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Delete employee error:", error);
    res.status(500).json({ message: "Failed to delete employee" });
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

// View 1 — Available rooms per city
router.get("/views/available-rooms-per-city", async (_req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT city, COUNT(*) AS available_rooms
       FROM available_rooms_view
       GROUP BY city
       ORDER BY city ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error("View 1 error:", error);
    res.status(500).json({ message: "Failed to fetch available rooms per city" });
  }
});

// View 2 — Total room capacity per hotel
router.get("/views/hotel-room-capacity", async (_req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT hotel_id, hotel_name, city, country, total_rooms
       FROM hotel_room_count_view
       ORDER BY hotel_name ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error("View 2 error:", error);
    res.status(500).json({ message: "Failed to fetch hotel room capacity" });
  }
});

export default router;
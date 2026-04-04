import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../config/db.js';

const generateToken = (id: number, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: '7d',
  });
};

export const registerCustomer = async (req: Request, res: Response) => {
  try {
    const {
      full_name,
      address,
      city,
      state,
      postal_code,
      country,
      id_type,
      id_number,
      registration_date,
      email,
      password,
    } = req.body;

    if (
      !full_name ||
      !address ||
      !city ||
      !country ||
      !id_type ||
      !id_number ||
      !registration_date ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: 'All required customer fields must be provided',
      });
    }

    const [existing] = await pool.query(
      'SELECT * FROM customer WHERE email = ?',
      [email]
    );

    if ((existing as any[]).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer email already exists',
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO customer (
        full_name, address, city, state, postal_code, country,
        id_type, id_number, registration_date, email, password_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        full_name,
        address,
        city,
        state || null,
        postal_code || null,
        country,
        id_type,
        id_number,
        registration_date,
        email,
        password_hash,
      ]
    );

    const customerId = (result as any).insertId;
    const token = generateToken(customerId, 'customer');

    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      data: {
        customer_id: customerId,
        email,
        role: 'customer',
        token,
      },
    });
  } catch (error) {
    console.error('registerCustomer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during customer registration',
    });
  }
};

export const loginCustomer = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      'SELECT * FROM customer WHERE email = ?',
      [email]
    );

    const customers = rows as any[];

    if (customers.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid customer credentials',
      });
    }

    const customer = customers[0];
    const isMatch = await bcrypt.compare(password, customer.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid customer credentials',
      });
    }

    const token = generateToken(customer.customer_id, 'customer');

    res.status(200).json({
      success: true,
      message: 'Customer login successful',
      data: {
        customer_id: customer.customer_id,
        full_name: customer.full_name,
        email: customer.email,
        role: 'customer',
        token,
      },
    });
  } catch (error) {
    console.error('loginCustomer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during customer login',
    });
  }
};

export const registerEmployee = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      hotel_id,
      full_name,
      address,
      city,
      state,
      postal_code,
      country,
      ssn_sin,
      email,
      password,
      role_id,
    } = req.body;

    if (
      !hotel_id ||
      !full_name ||
      !address ||
      !city ||
      !country ||
      !ssn_sin ||
      !email ||
      !password ||
      !role_id
    ) {
      return res.status(400).json({
        success: false,
        message: 'All required employee fields must be provided',
      });
    }

    const [existing] = await connection.query(
      'SELECT * FROM employee WHERE email = ? OR ssn_sin = ?',
      [email, ssn_sin]
    );

    if ((existing as any[]).length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Employee email or SSN/SIN already exists',
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await connection.query(
      `INSERT INTO employee (
        hotel_id, full_name, address, city, state, postal_code,
        country, ssn_sin, email, password_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        hotel_id,
        full_name,
        address,
        city,
        state || null,
        postal_code || null,
        country,
        ssn_sin,
        email,
        password_hash,
      ]
    );

    const employeeId = (result as any).insertId;

    await connection.query(
      'INSERT INTO employee_role (employee_id, role_id) VALUES (?, ?)',
      [employeeId, role_id]
    );

    await connection.commit();

    const token = generateToken(employeeId, 'employee');

    res.status(201).json({
      success: true,
      message: 'Employee registered successfully',
      data: {
        employee_id: employeeId,
        email,
        role: 'employee',
        token,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error('registerEmployee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during employee registration',
    });
  } finally {
    connection.release();
  }
};

export const loginEmployee = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      `SELECT 
        e.employee_id,
        e.full_name,
        e.email,
        e.password_hash,
        r.role_name
      FROM employee e
      LEFT JOIN employee_role er ON e.employee_id = er.employee_id
      LEFT JOIN role r ON er.role_id = r.role_id
      WHERE e.email = ?`,
      [email]
    );

    const employees = rows as any[];

    if (employees.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid employee credentials',
      });
    }

    const employee = employees[0];
    const isMatch = await bcrypt.compare(password, employee.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid employee credentials',
      });
    }

    const token = generateToken(employee.employee_id, employee.role_name || 'employee');

    res.status(200).json({
      success: true,
      message: 'Employee login successful',
      data: {
        employee_id: employee.employee_id,
        full_name: employee.full_name,
        email: employee.email,
        role: employee.role_name,
        token,
      },
    });
  } catch (error) {
    console.error('loginEmployee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during employee login',
    });
  }
};
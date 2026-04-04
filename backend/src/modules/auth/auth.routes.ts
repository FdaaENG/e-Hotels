import express from 'express';
import {
  registerCustomer,
  loginCustomer,
  registerEmployee,
  loginEmployee,
} from './auth.controller.js';

const router = express.Router();

router.post('/customer/register', registerCustomer);
router.post('/customer/login', loginCustomer);
router.post('/employee/register', registerEmployee);
router.post('/employee/login', loginEmployee);

export default router;
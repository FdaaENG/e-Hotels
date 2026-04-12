import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

type UserType = 'customer' | 'employee';

interface LoginFormData {
  userType: UserType;
  email: string;
  password: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    role: string;
    customer_id?: number;
    employee_id?: number;
    full_name?: string;
    email?: string;
  };
}

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginFormData>({
    userType: 'customer',
    email: '',
    password: '',
  });

  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const endpoint =
        formData.userType === 'customer'
          ? `${API_URL}/api/auth/customer/login`
          : `${API_URL}/api/auth/employee/login`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.data?.token) {
        localStorage.setItem('token', data.data.token);
      }

      if (data.data?.role) {
        localStorage.setItem('role', data.data.role);
      }

      localStorage.setItem('user', JSON.stringify(data.data || {}));

      if (formData.userType === 'customer') {
        const customerId = data.data?.customer_id;
        if (customerId) {
          localStorage.setItem('customer_id', String(customerId));
        }
      } else {
        const employeeId = data.data?.employee_id;
        if (employeeId) {
          localStorage.setItem('employee_id', String(employeeId));
        }
      }
      
      setMessage('Login successful');

      if (formData.userType === 'customer') {
        navigate('/customer-dashboard');
      } else {
        navigate('/employee-dashboard');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{
        background: 'linear-gradient(135deg, #e3f2fd, #f8f9fa, #eef2ff)',
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="row g-0">
                <div
                  className="col-md-6 text-white p-5 d-flex flex-column justify-content-center"
                  style={{
                    background: 'linear-gradient(135deg, #0d6efd, #6610f2)',
                  }}
                >
                  <h1 className="fw-bold mb-3">Welcome Back</h1>
                  <p className="mb-4">
                    Sign in to access your account and continue managing your
                    hotel services smoothly.
                  </p>

                  <div className="bg-white bg-opacity-10 rounded-3 p-3 mb-3">
                    <h5 className="fw-semibold">Customer Access</h5>
                    <p className="mb-0">
                      Manage bookings, reservations, and your account details.
                    </p>
                  </div>

                  <div className="bg-white bg-opacity-10 rounded-3 p-3">
                    <h5 className="fw-semibold">Employee Access</h5>
                    <p className="mb-0">
                      Access dashboard tools and manage hotel operations.
                    </p>
                  </div>
                </div>

                <div className="col-md-6 p-5 bg-white">
                  <h2 className="fw-bold mb-2">Login</h2>
                  <p className="text-muted mb-4">
                    Enter your credentials to continue
                  </p>

                  {message && (
                    <div className="alert alert-success" role="alert">
                      {message}
                    </div>
                  )}

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Login as</label>
                      <select
                        name="userType"
                        value={formData.userType}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="customer">Customer</option>
                        <option value="employee">Employee</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter your password"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary w-100 py-2 fw-semibold"
                    >
                      {loading ? 'Logging in...' : 'Login'}
                    </button>
                  </form>

                  <div className="text-center mt-4">
                    <p className="mb-2">
                      New customer?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/register/customer')}
                        className="btn btn-link p-0 text-decoration-none"
                      >
                        Create customer account
                      </button>
                    </p>

                    <p className="mb-0">
                      New employee?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/register/employee')}
                        className="btn btn-link p-0 text-decoration-none"
                      >
                        Create employee account
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>    
    </div>
  );
}
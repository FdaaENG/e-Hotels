import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface EmployeeFormData {
  hotel_id: string;
  full_name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  ssn_sin: string;
  email: string;
  password: string;
  role_id: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

export default function RegisterEmployeePage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<EmployeeFormData>({
    hotel_id: '',
    full_name: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    ssn_sin: '',
    email: '',
    password: '',
    role_id: '',
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/employee/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          hotel_id: Number(formData.hotel_id),
          role_id: Number(formData.role_id),
        }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Employee registration failed');
      }

      setMessage('Employee registered successfully');
      setTimeout(() => navigate('/login'), 1200);
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
      className="min-vh-100 d-flex align-items-center justify-content-center py-5"
      style={{
        background: 'linear-gradient(135deg, #e3f2fd, #f8f9fa, #eef2ff)',
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-9">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="row g-0">
                {/* LEFT SIDE */}
                <div
                  className="col-md-5 text-white p-4 p-md-5 d-flex flex-column justify-content-center"
                  style={{
                    background: 'linear-gradient(135deg, #0d6efd, #6610f2)',
                  }}
                >
                  <h2 className="fw-bold mb-3">Employee Registration</h2>
                  <p className="mb-4">
                    Create an employee account to manage hotel operations and
                    access internal tools.
                  </p>

                  <div className="bg-white bg-opacity-10 rounded-4 p-3 mb-3">
                    <h6 className="fw-bold mb-2">System Access</h6>
                    <p className="mb-0 small">
                      Employees can access dashboards, manage bookings, and
                      operate hotel services.
                    </p>
                  </div>

                  <div className="bg-white bg-opacity-10 rounded-4 p-3">
                    <h6 className="fw-bold mb-2">Secure Registration</h6>
                    <p className="mb-0 small">
                      Your data is securely stored and linked to your role and
                      hotel.
                    </p>
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="col-md-7 bg-white p-4 p-md-5">
                  <div className="mb-4">
                    <h3 className="fw-bold mb-1">Signup</h3>
                    <p className="text-muted mb-0">
                      Fill in employee details below
                    </p>
                  </div>

                  {message && (
                    <div className="alert alert-success">{message}</div>
                  )}
                  {error && (
                    <div className="alert alert-danger">{error}</div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">
                          Hotel ID
                        </label>
                        <input
                          type="number"
                          name="hotel_id"
                          value={formData.hotel_id}
                          onChange={handleChange}
                          className="form-control"
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">
                          Role ID
                        </label>
                        <input
                          type="number"
                          name="role_id"
                          value={formData.role_id}
                          onChange={handleChange}
                          className="form-control"
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          className="form-control"
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">
                          Address
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="form-control"
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="form-control"
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">State</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          name="postal_code"
                          value={formData.postal_code}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">
                          Country
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className="form-control"
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">
                          SSN / SIN
                        </label>
                        <input
                          type="text"
                          name="ssn_sin"
                          value={formData.ssn_sin}
                          onChange={handleChange}
                          className="form-control"
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="form-control"
                          required
                        />
                      </div>

                      <div className="col-12 mb-4">
                        <label className="form-label fw-semibold">
                          Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="form-control"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary w-100 py-2 fw-semibold"
                    >
                      {loading ? 'Registering...' : 'Register Employee'}
                    </button>

                    <div className="text-center mt-4">
                      <span className="text-muted">
                        Already have an account?{' '}
                      </span>
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="btn btn-link p-0 text-decoration-none"
                      >
                        Login here
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
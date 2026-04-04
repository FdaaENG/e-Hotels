import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface CustomerFormData {
  full_name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  id_type: string;
  id_number: string;
  registration_date: string;
  email: string;
  password: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

export default function RegisterCustomerPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CustomerFormData>({
    full_name: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    id_type: '',
    id_number: '',
    registration_date: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
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
      const response = await fetch(`${API_URL}/api/auth/customer/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Customer registration failed');
      }

      setMessage('Customer registered successfully');
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
                <div
                  className="col-md-5 text-white p-4 p-md-5 d-flex flex-column justify-content-center"
                  style={{
                    background: 'linear-gradient(135deg, #0d6efd, #6610f2)',
                  }}
                >
                  <h2 className="fw-bold mb-3">Create Customer Account</h2>
                  <p className="mb-4">
                    Register to manage your reservations, bookings, and personal
                    account details in one place.
                  </p>

                  <div className="bg-white bg-opacity-10 rounded-4 p-3 mb-3">
                    <h6 className="fw-bold mb-2">Easy Registration</h6>
                    <p className="mb-0 small">
                      Fill in your personal and identification details to create
                      your account securely.
                    </p>
                  </div>

                  <div className="bg-white bg-opacity-10 rounded-4 p-3">
                    <h6 className="fw-bold mb-2">Quick Access</h6>
                    <p className="mb-0 small">
                      After registration, you can sign in and start using the
                      customer dashboard.
                    </p>
                  </div>
                </div>

                <div className="col-md-7 bg-white p-4 p-md-5">
                  <div className="mb-4">
                    <h3 className="fw-bold mb-1">Customer Signup</h3>
                    <p className="text-muted mb-0">
                      Please fill in the information below
                    </p>
                  </div>

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
                    <div className="row">
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
                          placeholder="Enter full name"
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
                          placeholder="Enter address"
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
                          placeholder="Enter city"
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
                          placeholder="Enter state"
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
                          placeholder="Enter postal code"
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
                          placeholder="Enter country"
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">
                          ID Type
                        </label>
                        <input
                          type="text"
                          name="id_type"
                          value={formData.id_type}
                          onChange={handleChange}
                          className="form-control"
                          placeholder="Passport, Driver License..."
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">
                          ID Number
                        </label>
                        <input
                          type="text"
                          name="id_number"
                          value={formData.id_number}
                          onChange={handleChange}
                          className="form-control"
                          placeholder="Enter ID number"
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">
                          Registration Date
                        </label>
                        <input
                          type="date"
                          name="registration_date"
                          value={formData.registration_date}
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
                          placeholder="Enter email"
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
                          placeholder="Enter password"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary w-100 py-2 fw-semibold"
                    >
                      {loading ? 'Registering...' : 'Register Customer'}
                    </button>

                    <div className="text-center mt-4">
                      <span className="text-muted">Already have an account? </span>
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
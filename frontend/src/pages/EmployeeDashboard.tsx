import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000";

type Booking = {
  booking_id: number;
  customer_id: number;
  customer_name: string;
  hotel_name: string;
  city: string;
  room_id: number;
  capacity: string;
  view_type: string;
  price: number;
  start_date: string;
  end_date: string;
};

type Room = {
  room_id: number;
  hotel_name: string;
  city: string;
  capacity: string;
  view_type: string;
  price: number;
  star_category: number;
  is_extendable: number | boolean;
};

type Customer = {
  customer_id: number;
  full_name: string;
  email: string;
};

type Renting = {
  renting_id: number;
  customer_name: string;
  hotel_name: string;
  city: string;
  room_id: number;
  capacity: string;
  price: number;
  checkin_date: string;
  checkout_date: string;
  status: string;
  total_amount: number;
};

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsError, setBookingsError] = useState("");
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState("");

  const employeeId = localStorage.getItem("employee_id");
  // Walk-in renting state
  const [rentCustomerId, setRentCustomerId] = useState("");
  const [rentRoomId, setRentRoomId] = useState("");
  const [rentCheckin, setRentCheckin] = useState("");
  const [rentCheckout, setRentCheckout] = useState("");
  const [rentError, setRentError] = useState("");
  const [rentSuccess, setRentSuccess] = useState("");
  const [rentLoading, setRentLoading] = useState(false);

  // Dropdown data
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [rentings, setRentings] = useState<Renting[]>([]);
  const [rentingsError, setRentingsError] = useState("");
  const [paymentRentingId, setPaymentRentingId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [availableRoomsPerCity, setAvailableRoomsPerCity] = useState<{ city: string; available_rooms: number }[]>([]);
  const [hotelRoomCapacity, setHotelRoomCapacity] = useState<{ hotel_id: number; hotel_name: string; city: string; country: string; total_rooms: number }[]>([]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("employee_id");
    navigate("/");
  };

  const fetchActiveBookings = async () => {
    try {
      setBookingsLoading(true);
      setBookingsError("");
      const res = await fetch(`${API_BASE}/api/rooms/active-bookings`);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setBookingsError(err instanceof Error ? err.message : "Error loading bookings");
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleCheckin = async (bookingId: number) => {
    if (!employeeId) {
      setBookingsError("Employee not logged in.");
      return;
    }

    try {
      setBookingsError("");
      const res = await fetch(`${API_BASE}/api/rooms/checkin/${bookingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: Number(employeeId) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Check-in failed");

      setCheckinSuccess(`Booking #${bookingId} checked in successfully!`);
      setTimeout(() => setCheckinSuccess(""), 4000);
      fetchActiveBookings(); // refresh the list
      fetchActiveRentings();
    } catch (err) {
      setBookingsError(err instanceof Error ? err.message : "Check-in failed");
    }
  };

  const fetchCustomers = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/rooms/customers`);
    const data = await res.json();
    setCustomers(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Failed to fetch customers:", err);
  }
};

const fetchAvailableRooms = async () => {
  try {
    const params = new URLSearchParams();
    if (rentCheckin) params.append("startDate", rentCheckin);
    if (rentCheckout) params.append("endDate", rentCheckout);
    const res = await fetch(`${API_BASE}/api/rooms/search?${params.toString()}`);
    const data = await res.json();
    setAvailableRooms(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Failed to fetch rooms:", err);
  }
};

const handleWalkInRent = async () => {
  if (!rentCustomerId || !rentRoomId || !rentCheckin || !rentCheckout) {
    setRentError("All fields are required.");
    return;
  }

  if (!employeeId) {
    setRentError("Employee not logged in.");
    return;
  }

  try {
    setRentLoading(true);
    setRentError("");

    const res = await fetch(`${API_BASE}/api/rooms/rent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: Number(rentCustomerId),
        roomId: Number(rentRoomId),
        checkinDate: rentCheckin,
        checkoutDate: rentCheckout,
        employeeId: Number(employeeId),
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Renting failed");

    setRentSuccess(`Walk-in renting created successfully! Renting #${data.rentingId}`);
    setTimeout(() => setRentSuccess(""), 4000);

    // Reset form
    setRentCustomerId("");
    setRentRoomId("");
    setRentCheckin("");
    setRentCheckout("");
    setAvailableRooms([]);
    fetchActiveRentings();
  } catch (err) {
    setRentError(err instanceof Error ? err.message : "Renting failed");
  } finally {
    setRentLoading(false);
  }
  };

  const fetchActiveRentings = async () => {
  try {
    setRentingsError("");
    const res = await fetch(`${API_BASE}/api/rooms/active-rentings`);
    if (!res.ok) throw new Error("Failed to fetch rentings");
    const data = await res.json();
    setRentings(Array.isArray(data) ? data : []);
  } catch (err) {
    setRentingsError(err instanceof Error ? err.message : "Error loading rentings");
  }
};

const handlePayment = async () => {
  if (!paymentRentingId || !paymentAmount || !paymentMethod) {
    setPaymentError("All fields are required.");
    return;
  }

  try {
    setPaymentLoading(true);
    setPaymentError("");

    const res = await fetch(`${API_BASE}/api/rooms/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rentingId: Number(paymentRentingId),
        amount: Number(paymentAmount),
        method: paymentMethod,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Payment failed");

    setPaymentSuccess(`Payment recorded successfully! Payment #${data.paymentId}`);
    setTimeout(() => setPaymentSuccess(""), 4000);

    // Reset form
    setPaymentRentingId("");
    setPaymentAmount("");
    setPaymentMethod("");
    fetchActiveRentings();
  } catch (err) {
    setPaymentError(err instanceof Error ? err.message : "Payment failed");
  } finally {
    setPaymentLoading(false);
  }
  };

  const fetchViews = async () => {
  try {
    const [view1Res, view2Res] = await Promise.all([
      fetch(`${API_BASE}/api/misc/views/available-rooms-per-city`),
      fetch(`${API_BASE}/api/misc/views/hotel-room-capacity`),
    ]);
    const view1Data = await view1Res.json();
    const view2Data = await view2Res.json();
    setAvailableRoomsPerCity(Array.isArray(view1Data) ? view1Data : []);
    setHotelRoomCapacity(Array.isArray(view2Data) ? view2Data : []);
  } catch (err) {
    console.error("Failed to fetch views:", err);
  }
  };

  useEffect(() => {
    fetchActiveBookings();
    fetchCustomers();
    fetchActiveRentings();
    fetchViews();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "40px 24px",
        fontFamily: "Arial, sans-serif",
        color: "#1e293b",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ margin: 0, color: "#2563eb", fontWeight: 700, fontSize: "14px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              e-Hotels
            </p>
            <h1 style={{ margin: "10px 0 12px 0", fontSize: "48px", fontWeight: 700, color: "#0f172a" }}>
              Employee Dashboard
            </h1>
            <p style={{ margin: 0, fontSize: "18px", color: "#475569", lineHeight: 1.6 }}>
              Manage check-ins, walk-in rentings, and customer payments.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexShrink: 0, paddingTop: "8px" }}>
          <button
            onClick={() => navigate("/management")}
            style={{
              background: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              padding: "10px 18px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Management
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: "#ffffff",
              color: "#dc2626",
              border: "1px solid #dc2626",
              borderRadius: "10px",
              padding: "10px 18px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Log Out
          </button>
        </div>
        </div>

        {/* Active Bookings / Check-in Section */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            padding: "28px",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
            border: "1px solid #e2e8f0",
          }}
        >
          <h2 style={{ margin: "0 0 8px 0", fontSize: "28px", fontWeight: 700, color: "#0f172a" }}>
            Pending Check-ins
          </h2>
          <p style={{ margin: "0 0 24px 0", color: "#64748b", fontSize: "15px" }}>
            Active bookings waiting for customer check-in.
          </p>

          {checkinSuccess && (
            <p style={{ color: "#16a34a", fontWeight: 600, fontSize: "14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
              {checkinSuccess}
            </p>
          )}

          {bookingsError && (
            <p style={{ color: "#dc2626", fontWeight: 600, fontSize: "14px", marginBottom: "16px" }}>
              {bookingsError}
            </p>
          )}

          {bookingsLoading && (
            <p style={{ color: "#64748b" }}>Loading bookings...</p>
          )}

          {!bookingsLoading && bookings.length === 0 && !bookingsError && (
            <p style={{ color: "#64748b" }}>No active bookings at the moment.</p>
          )}

          {bookings.length > 0 && (
            <div style={{ display: "grid", gap: "16px" }}>
              {bookings.map((booking) => (
                <div
                  key={booking.booking_id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "18px",
                    background: "#f8fafc",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    gap: "20px",
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", color: "#0f172a" }}>
                      {booking.customer_name}
                    </h3>
                    <p style={detailText}>{booking.hotel_name} — {booking.city}</p>
                    <p style={detailText}>Room #{booking.room_id} • {booking.capacity} • {booking.view_type} view</p>
                    <p style={detailText}>
                      {new Date(booking.start_date).toLocaleDateString()} → {new Date(booking.end_date).toLocaleDateString()}
                    </p>
                    <p style={detailText}>Booking #{booking.booking_id}</p>
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ margin: "0 0 12px 0", fontSize: "22px", fontWeight: 700, color: "#2563eb" }}>
                      ${Number(booking.price).toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleCheckin(booking.booking_id)}
                      style={{
                        background: "#2563eb",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "10px",
                        padding: "10px 16px",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Check In
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Walk-in Renting Section */}
        <div
          style={{
            marginTop: "24px",
            background: "#ffffff",
            borderRadius: "18px",
            padding: "28px",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
            border: "1px solid #e2e8f0",
          }}
        >
          <h2 style={{ margin: "0 0 8px 0", fontSize: "28px", fontWeight: 700, color: "#0f172a" }}>
            Walk-in Renting
          </h2>
          <p style={{ margin: "0 0 24px 0", color: "#64748b", fontSize: "15px" }}>
            Directly rent a room for a customer who has arrived without a prior booking.
          </p>

          {rentSuccess && (
            <p style={{ color: "#16a34a", fontWeight: 600, fontSize: "14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
              {rentSuccess}
            </p>
          )}

          {rentError && (
            <p style={{ color: "#dc2626", fontWeight: 600, fontSize: "14px", marginBottom: "16px" }}>
              {rentError}
            </p>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "18px 20px" }}>
            <div>
              <label style={labelStyle}>Customer</label>
              <select
                value={rentCustomerId}
                onChange={(e) => setRentCustomerId(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select a customer</option>
                {customers.map((c) => (
                  <option key={c.customer_id} value={c.customer_id}>
                    {c.full_name} — {c.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Check-in Date</label>
              <input
                type="date"
                value={rentCheckin}
                onChange={(e) => setRentCheckin(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Check-out Date</label>
              <input
                type="date"
                value={rentCheckout}
                onChange={(e) => setRentCheckout(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                onClick={fetchAvailableRooms}
                disabled={!rentCheckin || !rentCheckout}
                style={{
                  width: "100%",
                  background: (!rentCheckin || !rentCheckout) ? "#93c5fd" : "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "14px 24px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: (!rentCheckin || !rentCheckout) ? "not-allowed" : "pointer",
                }}
              >
                Find Available Rooms
              </button>
            </div>

            {availableRooms.length > 0 && (
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Select Room</label>
                <select
                  value={rentRoomId}
                  onChange={(e) => setRentRoomId(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select a room</option>
                  {availableRooms.map((r) => (
                    <option key={r.room_id} value={r.room_id}>
                      Room #{r.room_id} — {r.hotel_name}, {r.city} | {r.capacity} | {r.view_type} view | ${Number(r.price).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            onClick={handleWalkInRent}
            disabled={rentLoading || !rentCustomerId || !rentRoomId || !rentCheckin || !rentCheckout}
            style={{
              marginTop: "24px",
              background: rentLoading ? "#93c5fd" : "#16a34a",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              padding: "14px 24px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: rentLoading ? "not-allowed" : "pointer",
              boxShadow: "0 8px 20px rgba(22, 163, 74, 0.25)",
            }}
          >
            {rentLoading ? "Processing..." : "Confirm Walk-in Renting"}
          </button>
        </div>
        {/* Payment Entry Section */}
        <div
          style={{
            marginTop: "24px",
            background: "#ffffff",
            borderRadius: "18px",
            padding: "28px",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
            border: "1px solid #e2e8f0",
          }}
        >
          <h2 style={{ margin: "0 0 8px 0", fontSize: "28px", fontWeight: 700, color: "#0f172a" }}>
            Record Payment
          </h2>
          <p style={{ margin: "0 0 24px 0", color: "#64748b", fontSize: "15px" }}>
            Record a payment for an active renting.
          </p>

          {paymentSuccess && (
            <p style={{ color: "#16a34a", fontWeight: 600, fontSize: "14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
              {paymentSuccess}
            </p>
          )}

          {paymentError && (
            <p style={{ color: "#dc2626", fontWeight: 600, fontSize: "14px", marginBottom: "16px" }}>
              {paymentError}
            </p>
          )}

          {rentingsError && (
            <p style={{ color: "#dc2626", fontSize: "14px", marginBottom: "16px" }}>
              {rentingsError}
            </p>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "18px 20px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Select Renting</label>
              <select
                value={paymentRentingId}
                onChange={(e) => {
                  setPaymentRentingId(e.target.value);
                  // Auto-fill amount based on selected renting
                  const selected = rentings.find(r => r.renting_id === Number(e.target.value));
                  if (selected) setPaymentAmount(String(selected.total_amount));
                }}
                style={inputStyle}
              >
                <option value="">Select a renting</option>
                {rentings.map((r) => (
                  <option key={r.renting_id} value={r.renting_id}>
                    Renting #{r.renting_id} — {r.customer_name} | {r.hotel_name} | ${Number(r.total_amount).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Amount ($)</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                style={inputStyle}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label style={labelStyle}>Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select method</option>
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="online">Online</option>
              </select>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={paymentLoading || !paymentRentingId || !paymentAmount || !paymentMethod}
            style={{
              marginTop: "24px",
              background: paymentLoading ? "#93c5fd" : "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              padding: "14px 24px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: paymentLoading ? "not-allowed" : "pointer",
              boxShadow: "0 8px 20px rgba(37, 99, 235, 0.25)",
            }}
          >
            {paymentLoading ? "Processing..." : "Record Payment"}
          </button>
        </div>
        {/* SQL Views Section */}
        <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          
          {/* View 1 — Available Rooms Per City */}
          <div style={{ background: "#ffffff", borderRadius: "18px", padding: "28px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)", border: "1px solid #e2e8f0" }}>
            <h2 style={{ margin: "0 0 4px 0", fontSize: "22px", fontWeight: 700, color: "#0f172a" }}>
              Available Rooms by City
            </h2>
            <p style={{ margin: "0 0 20px 0", color: "#64748b", fontSize: "13px" }}>
              View 1 — Live count of available rooms per area
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={thStyle}>City</th>
                  <th style={thStyle}>Available Rooms</th>
                </tr>
              </thead>
              <tbody>
                {availableRoomsPerCity.map((row) => (
                  <tr key={row.city} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={tdStyle}>{row.city}</td>
                    <td style={tdStyle}>{row.available_rooms}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* View 2 — Hotel Room Capacity */}
          <div style={{ background: "#ffffff", borderRadius: "18px", padding: "28px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)", border: "1px solid #e2e8f0" }}>
            <h2 style={{ margin: "0 0 4px 0", fontSize: "22px", fontWeight: 700, color: "#0f172a" }}>
              Total Rooms per Hotel
            </h2>
            <p style={{ margin: "0 0 20px 0", color: "#64748b", fontSize: "13px" }}>
              View 2 — Aggregated room capacity per hotel
            </p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                    <th style={thStyle}>Hotel</th>
                    <th style={thStyle}>City</th>
                    <th style={thStyle}>Country</th>
                    <th style={thStyle}>Total Rooms</th>
                  </tr>
                </thead>
                <tbody>
                  {hotelRoomCapacity.map((row) => (
                    <tr key={row.hotel_id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={tdStyle}>{row.hotel_name}</td>
                      <td style={tdStyle}>{row.city}</td>
                      <td style={tdStyle}>{row.country}</td>
                      <td style={tdStyle}>{row.total_rooms}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  fontSize: "14px",
  fontWeight: 600,
  color: "#334155",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  fontSize: "15px",
  color: "#0f172a",
  background: "#ffffff",
  boxSizing: "border-box",
};
const detailText: React.CSSProperties = {
  margin: "4px 0",
  color: "#475569",
  fontSize: "14px",
};

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  fontWeight: 700,
  color: "#475569",
  fontSize: "13px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  color: "#1e293b",
  verticalAlign: "middle",
};
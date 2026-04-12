import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";


const API_BASE = "http://localhost:3000";

type Hotel = {
  hotel_id: number;
  chain_id: number;
  chain_name: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  star_category: number;
  num_rooms: number;
};

type Chain = {
  chain_id: number;
  name: string;
};

type Room = {
  room_id: number;
  hotel_id: number;
  hotel_name: string;
  price: number;
  capacity: string;
  view_type: string;
  is_extendable: number | boolean;
};

type Customer = {
  customer_id: number;
  full_name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  id_type: string;
  id_number: string;
  registration_date: string;
};

type Employee = {
  employee_id: number;
  hotel_id: number;
  hotel_name: string;
  full_name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  ssn_sin: string;
  roles: string;
};

const emptyEmployee = {
  hotel_id: "",
  full_name: "",
  address: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
};

const emptyCustomer = {
  full_name: "",
  email: "",
  address: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
  id_type: "",
  id_number: "",
};

const emptyRoom = {
  hotel_id: "",
  price: "",
  capacity: "",
  view_type: "",
  is_extendable: false,
};

const emptyHotel = {
  chain_id: "",
  name: "",
  address: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
  star_category: "",
  num_rooms: "",
};

export default function ManagementPage() {
  const navigate = useNavigate();

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [chains, setChains] = useState<Chain[]>([]);
  const [hotelForm, setHotelForm] = useState(emptyHotel);
  const [editingHotelId, setEditingHotelId] = useState<number | null>(null);
  const [hotelError, setHotelError] = useState("");
  const [hotelSuccess, setHotelSuccess] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomForm, setRoomForm] = useState<typeof emptyRoom>(emptyRoom);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [roomError, setRoomError] = useState("");
  const [roomSuccess, setRoomSuccess] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerForm, setCustomerForm] = useState<typeof emptyCustomer>(emptyCustomer);
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);
  const [customerError, setCustomerError] = useState("");
  const [customerSuccess, setCustomerSuccess] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeForm, setEmployeeForm] = useState<typeof emptyEmployee>(emptyEmployee);
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null);
  const [employeeError, setEmployeeError] = useState("");
  const [employeeSuccess, setEmployeeSuccess] = useState("");
  const hotelFormRef = useRef<HTMLDivElement>(null);
  const roomFormRef = useRef<HTMLDivElement>(null);
  const customerFormRef = useRef<HTMLDivElement>(null);
  const employeeFormRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("employee_id");
    navigate("/");
  };

  const fetchHotels = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/misc/hotels`);
    const data = await res.json();
    setHotels(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Failed to fetch hotels:", err);
  }
};

  const fetchChains = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/misc/chains`);
      const data = await res.json();
      setChains(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch chains:", err);
    }
  };

  const handleHotelSubmit = async () => {
    if (!hotelForm.chain_id || !hotelForm.name || !hotelForm.address || !hotelForm.city || !hotelForm.country || !hotelForm.star_category || !hotelForm.num_rooms) {
      setHotelError("All required fields must be provided.");
      return;
    }

    try {
      setHotelError("");
      const url = editingHotelId
        ? `${API_BASE}/api/misc/hotels/${editingHotelId}`
        : `${API_BASE}/api/misc/hotels`;
      const method = editingHotelId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hotelForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save hotel");

      setHotelSuccess(editingHotelId ? "Hotel updated successfully!" : "Hotel added successfully!");
      setTimeout(() => setHotelSuccess(""), 3000);
      setHotelForm(emptyHotel);
      setEditingHotelId(null);
      fetchHotels();
    } catch (err) {
      setHotelError(err instanceof Error ? err.message : "Failed to save hotel");
    }
  };

  const handleHotelEdit = (hotel: Hotel) => {
  setEditingHotelId(hotel.hotel_id);
  setHotelForm({
    chain_id: String(hotel.chain_id ?? ""),
    name: hotel.name ?? "",
    address: hotel.address ?? "",
    city: hotel.city ?? "",
    state: hotel.state ?? "",
    postal_code: hotel.postal_code ?? "",
    country: hotel.country ?? "",
    star_category: String(hotel.star_category ?? ""),
    num_rooms: String(hotel.num_rooms ?? ""),
  });
  setTimeout(() => hotelFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };
  
  const handleHotelDelete = async (hotelId: number) => {
    if (!window.confirm("Are you sure you want to delete this hotel? This will also delete all its rooms.")) return;

    try {
      const res = await fetch(`${API_BASE}/api/misc/hotels/${hotelId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete hotel");

      setHotelSuccess("Hotel deleted successfully!");
      setTimeout(() => setHotelSuccess(""), 3000);
      fetchHotels();
    } catch (err) {
      setHotelError(err instanceof Error ? err.message : "Failed to delete hotel");
    }
  };

  const fetchRooms = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/misc/rooms`);
    const data = await res.json();
    setRooms(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Failed to fetch rooms:", err);
  }
};

const handleRoomSubmit = async () => {
  if (!roomForm.hotel_id || !roomForm.price || !roomForm.capacity || !roomForm.view_type) {
    setRoomError("All required fields must be provided.");
    return;
  }

  try {
    setRoomError("");
    const url = editingRoomId
      ? `${API_BASE}/api/misc/rooms/${editingRoomId}`
      : `${API_BASE}/api/misc/rooms`;
    const method = editingRoomId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(roomForm),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to save room");

    setRoomSuccess(editingRoomId ? "Room updated successfully!" : "Room added successfully!");
    setTimeout(() => setRoomSuccess(""), 3000);
    setRoomForm(emptyRoom);
    setEditingRoomId(null);
    fetchRooms();
  } catch (err) {
    setRoomError(err instanceof Error ? err.message : "Failed to save room");
  }
};

const handleRoomEdit = (room: Room) => {
  setEditingRoomId(room.room_id);
  setRoomForm({
    hotel_id: String(room.hotel_id),
    price: String(room.price),
    capacity: room.capacity,
    view_type: room.view_type,
    is_extendable: Boolean(room.is_extendable),
  });
  setTimeout(() => roomFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
};

const handleRoomDelete = async (roomId: number) => {
  if (!window.confirm("Are you sure you want to delete this room?")) return;

  try {
    const res = await fetch(`${API_BASE}/api/misc/rooms/${roomId}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete room");

    setRoomSuccess("Room deleted successfully!");
    setTimeout(() => setRoomSuccess(""), 3000);
    fetchRooms();
  } catch (err) {
    setRoomError(err instanceof Error ? err.message : "Failed to delete room");
  }
};

const fetchCustomers = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/misc/customers`);
    const data = await res.json();
    setCustomers(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Failed to fetch customers:", err);
  }
};

const handleCustomerSubmit = async () => {
  if (!customerForm.full_name || !customerForm.address || !customerForm.city || !customerForm.country || !customerForm.id_type || !customerForm.id_number) {
    setCustomerError("All required fields must be provided.");
    return;
  }

  try {
    setCustomerError("");
    const res = await fetch(`${API_BASE}/api/misc/customers/${editingCustomerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerForm),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update customer");

    setCustomerSuccess("Customer updated successfully!");
    setTimeout(() => setCustomerSuccess(""), 3000);
    setCustomerForm(emptyCustomer);
    setEditingCustomerId(null);
    fetchCustomers();
  } catch (err) {
    setCustomerError(err instanceof Error ? err.message : "Failed to update customer");
  }
};

const handleCustomerEdit = (customer: Customer) => {
  setEditingCustomerId(customer.customer_id);
  setCustomerForm({
    full_name: customer.full_name,
    email: customer.email,
    address: customer.address,
    city: customer.city,
    state: customer.state || "",
    postal_code: customer.postal_code || "",
    country: customer.country,
    id_type: customer.id_type,
    id_number: customer.id_number,
  });
  setTimeout(() => customerFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
};

const handleCustomerDelete = async (customerId: number) => {
  if (!window.confirm("Are you sure you want to delete this customer?")) return;

  try {
    const res = await fetch(`${API_BASE}/api/misc/customers/${customerId}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete customer");

    setCustomerSuccess("Customer deleted successfully!");
    setTimeout(() => setCustomerSuccess(""), 3000);
    fetchCustomers();
  } catch (err) {
    setCustomerError(err instanceof Error ? err.message : "Failed to delete customer");
  }
};

const fetchEmployees = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/misc/employees`);
    const data = await res.json();
    setEmployees(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Failed to fetch employees:", err);
  }
};

const handleEmployeeSubmit = async () => {
  if (!employeeForm.full_name || !employeeForm.address || !employeeForm.city || !employeeForm.country || !employeeForm.hotel_id) {
    setEmployeeError("All required fields must be provided.");
    return;
  }

  try {
    setEmployeeError("");
    const res = await fetch(`${API_BASE}/api/misc/employees/${editingEmployeeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employeeForm),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update employee");

    setEmployeeSuccess("Employee updated successfully!");
    setTimeout(() => setEmployeeSuccess(""), 3000);
    setEmployeeForm(emptyEmployee);
    setEditingEmployeeId(null);
    fetchEmployees();
  } catch (err) {
    setEmployeeError(err instanceof Error ? err.message : "Failed to update employee");
  }
};

const handleEmployeeEdit = (employee: Employee) => {
  setEditingEmployeeId(employee.employee_id);
  setEmployeeForm({
    hotel_id: String(employee.hotel_id),
    full_name: employee.full_name,
    address: employee.address,
    city: employee.city,
    state: employee.state || "",
    postal_code: employee.postal_code || "",
    country: employee.country,
  });
  setTimeout(() => employeeFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
};

const handleEmployeeDelete = async (employeeId: number) => {
  if (!window.confirm("Are you sure you want to delete this employee?")) return;

  try {
    const res = await fetch(`${API_BASE}/api/misc/employees/${employeeId}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete employee");

    setEmployeeSuccess("Employee deleted successfully!");
    setTimeout(() => setEmployeeSuccess(""), 3000);
    fetchEmployees();
  } catch (err) {
    setEmployeeError(err instanceof Error ? err.message : "Failed to delete employee");
  }
};

useEffect(() => {
  fetchHotels();
  fetchChains();
  fetchRooms();
  fetchCustomers();
  fetchEmployees();
}, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb", padding: "40px 24px", fontFamily: "Arial, sans-serif", color: "#1e293b" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px" }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, color: "#2563eb", fontWeight: 700, fontSize: "14px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              e-Hotels
            </p>
            <h1 style={{ margin: "10px 0 12px 0", fontSize: "48px", fontWeight: 700, color: "#0f172a" }}>
              Management
            </h1>
            <p style={{ margin: 0, fontSize: "18px", color: "#475569", lineHeight: 1.6 }}>
              Manage hotels, rooms, customers and employees.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexShrink: 0, paddingTop: "8px" }}>
            <button onClick={() => navigate("/employee-dashboard")} style={{ background: "#ffffff", color: "#2563eb", border: "1px solid #2563eb", borderRadius: "10px", padding: "10px 18px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
              ← Back
            </button>
            <button onClick={handleLogout} style={{ background: "#ffffff", color: "#dc2626", border: "1px solid #dc2626", borderRadius: "10px", padding: "10px 18px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
              Log Out
            </button>
          </div>
        </div>

        {/* Hotels Section */}
        <div style={{ background: "#ffffff", borderRadius: "18px", padding: "28px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)", border: "1px solid #e2e8f0" }}>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "28px", fontWeight: 700, color: "#0f172a" }}>Hotels</h2>
          <p style={{ margin: "0 0 24px 0", color: "#64748b", fontSize: "15px" }}>Add, edit or delete hotels.</p>

          {hotelSuccess && (
            <p style={{ color: "#16a34a", fontWeight: 600, fontSize: "14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
              {hotelSuccess}
            </p>
          )}

          {hotelError && (
            <p style={{ color: "#dc2626", fontWeight: 600, fontSize: "14px", marginBottom: "16px" }}>
              {hotelError}
            </p>
          )}

          {/* Hotel Form */}
          <div ref={hotelFormRef} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>Hotel Chain</label>
              <select value={hotelForm.chain_id} onChange={(e) => setHotelForm((p) => ({ ...p, chain_id: e.target.value }))} style={inputStyle}>
                <option value="">Select chain</option>
                {chains.map((c) => (
                  <option key={c.chain_id} value={String(c.chain_id)}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Hotel Name</label>
              <input value={hotelForm.name} onChange={(e) => setHotelForm((p) => ({ ...p, name: e.target.value }))} style={inputStyle} placeholder="Hotel name" />
            </div>
            <div>
              <label style={labelStyle}>Address</label>
              <input value={hotelForm.address} onChange={(e) => setHotelForm((p) => ({ ...p, address: e.target.value }))} style={inputStyle} placeholder="Street address" />
            </div>
            <div>
              <label style={labelStyle}>City</label>
              <input value={hotelForm.city} onChange={(e) => setHotelForm((p) => ({ ...p, city: e.target.value }))} style={inputStyle} placeholder="City" />
            </div>
            <div>
              <label style={labelStyle}>State</label>
              <input value={hotelForm.state} onChange={(e) => setHotelForm((p) => ({ ...p, state: e.target.value }))} style={inputStyle} placeholder="State (optional)" />
            </div>
            <div>
              <label style={labelStyle}>Postal Code</label>
              <input value={hotelForm.postal_code} onChange={(e) => setHotelForm((p) => ({ ...p, postal_code: e.target.value }))} style={inputStyle} placeholder="Postal code (optional)" />
            </div>
            <div>
              <label style={labelStyle}>Country</label>
              <input value={hotelForm.country} onChange={(e) => setHotelForm((p) => ({ ...p, country: e.target.value }))} style={inputStyle} placeholder="Country" />
            </div>
            <div>
              <label style={labelStyle}>Star Category</label>
              <select value={hotelForm.star_category} onChange={(e) => setHotelForm((p) => ({ ...p, star_category: e.target.value }))} style={inputStyle}>
                <option value="">Select stars</option>
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Number of Rooms</label>
              <input type="number" value={hotelForm.num_rooms} onChange={(e) => setHotelForm((p) => ({ ...p, num_rooms: e.target.value }))} style={inputStyle} placeholder="0" min="1" />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
            <button onClick={handleHotelSubmit} style={{ background: "#2563eb", color: "#ffffff", border: "none", borderRadius: "10px", padding: "12px 24px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
              {editingHotelId ? "Update Hotel" : "Add Hotel"}
            </button>
            {editingHotelId && (
              <button onClick={() => { setHotelForm(emptyHotel); setEditingHotelId(null); setHotelError(""); }} style={{ background: "#ffffff", color: "#64748b", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "12px 24px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
                Cancel Edit
              </button>
            )}
          </div>

          {/* Hotels Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Chain</th>
                  <th style={thStyle}>City</th>
                  <th style={thStyle}>Country</th>
                  <th style={thStyle}>Stars</th>
                  <th style={thStyle}>Rooms</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map((hotel) => (
                  <tr key={hotel.hotel_id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={tdStyle}>{hotel.hotel_id}</td>
                    <td style={tdStyle}>{hotel.name}</td>
                    <td style={tdStyle}>{hotel.chain_name}</td>
                    <td style={tdStyle}>{hotel.city}</td>
                    <td style={tdStyle}>{hotel.country}</td>
                    <td style={tdStyle}>{hotel.star_category}★</td>
                    <td style={tdStyle}>{hotel.num_rooms}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => handleHotelEdit(hotel)} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                          Edit
                        </button>
                        <button onClick={() => handleHotelDelete(hotel.hotel_id)} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rooms Section */}
        <div style={{ marginTop: "24px", background: "#ffffff", borderRadius: "18px", padding: "28px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)", border: "1px solid #e2e8f0" }}>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "28px", fontWeight: 700, color: "#0f172a" }}>Rooms</h2>
          <p style={{ margin: "0 0 24px 0", color: "#64748b", fontSize: "15px" }}>Add, edit or delete rooms.</p>

          {roomSuccess && (
            <p style={{ color: "#16a34a", fontWeight: 600, fontSize: "14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
              {roomSuccess}
            </p>
          )}

          {roomError && (
            <p style={{ color: "#dc2626", fontWeight: 600, fontSize: "14px", marginBottom: "16px" }}>
              {roomError}
            </p>
          )}

          {/* Room Form */}
          <div ref={roomFormRef} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>Hotel</label>
              <select value={roomForm.hotel_id} onChange={(e) => setRoomForm((p) => ({ ...p, hotel_id: e.target.value }))} style={inputStyle}>
                <option value="">Select hotel</option>
                {hotels.map((h) => (
                  <option key={h.hotel_id} value={h.hotel_id}>{h.name} — {h.city}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Price ($)</label>
              <input type="number" value={roomForm.price} onChange={(e) => setRoomForm((p) => ({ ...p, price: e.target.value }))} style={inputStyle} placeholder="0.00" min="0" step="0.01" />
            </div>
            <div>
              <label style={labelStyle}>Capacity</label>
              <select value={roomForm.capacity} onChange={(e) => setRoomForm((p) => ({ ...p, capacity: e.target.value }))} style={inputStyle}>
                <option value="">Select capacity</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="triple">Triple</option>
                <option value="suite">Suite</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>View Type</label>
              <select value={roomForm.view_type} onChange={(e) => setRoomForm((p) => ({ ...p, view_type: e.target.value }))} style={inputStyle}>
                <option value="">Select view</option>
                <option value="sea">Sea</option>
                <option value="mountain">Mountain</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "28px" }}>
              <input
                type="checkbox"
                id="is_extendable"
                checked={Boolean(roomForm.is_extendable)}
                onChange={(e) => setRoomForm((p) => ({ ...p, is_extendable: e.target.checked }))}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              <label htmlFor="is_extendable" style={{ fontSize: "14px", fontWeight: 600, color: "#334155", cursor: "pointer" }}>
                Extendable
              </label>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
            <button onClick={handleRoomSubmit} style={{ background: "#2563eb", color: "#ffffff", border: "none", borderRadius: "10px", padding: "12px 24px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
              {editingRoomId ? "Update Room" : "Add Room"}
            </button>
            {editingRoomId && (
              <button onClick={() => { setRoomForm(emptyRoom); setEditingRoomId(null); setRoomError(""); }} style={{ background: "#ffffff", color: "#64748b", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "12px 24px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
                Cancel Edit
              </button>
            )}
          </div>

          {/* Rooms Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Hotel</th>
                  <th style={thStyle}>Price</th>
                  <th style={thStyle}>Capacity</th>
                  <th style={thStyle}>View</th>
                  <th style={thStyle}>Extendable</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.room_id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={tdStyle}>{room.room_id}</td>
                    <td style={tdStyle}>{room.hotel_name}</td>
                    <td style={tdStyle}>${Number(room.price).toFixed(2)}</td>
                    <td style={tdStyle}>{room.capacity}</td>
                    <td style={tdStyle}>{room.view_type}</td>
                    <td style={tdStyle}>{room.is_extendable ? "Yes" : "No"}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => handleRoomEdit(room)} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                          Edit
                        </button>
                        <button onClick={() => handleRoomDelete(room.room_id)} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customers Section */}
        <div style={{ marginTop: "24px", background: "#ffffff", borderRadius: "18px", padding: "28px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)", border: "1px solid #e2e8f0" }}>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "28px", fontWeight: 700, color: "#0f172a" }}>Customers</h2>
          <p style={{ margin: "0 0 24px 0", color: "#64748b", fontSize: "15px" }}>Edit or delete customers.</p>

          {customerSuccess && (
            <p style={{ color: "#16a34a", fontWeight: 600, fontSize: "14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
              {customerSuccess}
            </p>
          )}

          {customerError && (
            <p style={{ color: "#dc2626", fontWeight: 600, fontSize: "14px", marginBottom: "16px" }}>
              {customerError}
            </p>
          )}

          {/* Edit Form — only shown when editing */}
          {editingCustomerId && (
            <div ref={customerFormRef} style={{ marginBottom: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input value={customerForm.full_name} onChange={(e) => setCustomerForm((p) => ({ ...p, full_name: e.target.value }))} style={inputStyle} placeholder="Full name" />
                </div>
                <div>
                  <label style={labelStyle}>Address</label>
                  <input value={customerForm.address} onChange={(e) => setCustomerForm((p) => ({ ...p, address: e.target.value }))} style={inputStyle} placeholder="Address" />
                </div>
                <div>
                  <label style={labelStyle}>City</label>
                  <input value={customerForm.city} onChange={(e) => setCustomerForm((p) => ({ ...p, city: e.target.value }))} style={inputStyle} placeholder="City" />
                </div>
                <div>
                  <label style={labelStyle}>State</label>
                  <input value={customerForm.state} onChange={(e) => setCustomerForm((p) => ({ ...p, state: e.target.value }))} style={inputStyle} placeholder="State (optional)" />
                </div>
                <div>
                  <label style={labelStyle}>Postal Code</label>
                  <input value={customerForm.postal_code} onChange={(e) => setCustomerForm((p) => ({ ...p, postal_code: e.target.value }))} style={inputStyle} placeholder="Postal code (optional)" />
                </div>
                <div>
                  <label style={labelStyle}>Country</label>
                  <input value={customerForm.country} onChange={(e) => setCustomerForm((p) => ({ ...p, country: e.target.value }))} style={inputStyle} placeholder="Country" />
                </div>
                <div>
                  <label style={labelStyle}>ID Type</label>
                  <select value={customerForm.id_type} onChange={(e) => setCustomerForm((p) => ({ ...p, id_type: e.target.value }))} style={inputStyle}>
                    <option value="">Select ID type</option>
                    <option value="SSN">SSN</option>
                    <option value="SIN">SIN</option>
                    <option value="Passport">Passport</option>
                    <option value="Driver License">Driver License</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>ID Number</label>
                  <input value={customerForm.id_number} onChange={(e) => setCustomerForm((p) => ({ ...p, id_number: e.target.value }))} style={inputStyle} placeholder="ID number" />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={handleCustomerSubmit} style={{ background: "#2563eb", color: "#ffffff", border: "none", borderRadius: "10px", padding: "12px 24px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
                  Update Customer
                </button>
                <button onClick={() => { setCustomerForm(emptyCustomer); setEditingCustomerId(null); setCustomerError(""); }} style={{ background: "#ffffff", color: "#64748b", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "12px 24px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
                  Cancel Edit
                </button>
              </div>
            </div>
          )}

          {/* Customers Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>City</th>
                  <th style={thStyle}>Country</th>
                  <th style={thStyle}>ID Type</th>
                  <th style={thStyle}>Registered</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.customer_id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={tdStyle}>{customer.customer_id}</td>
                    <td style={tdStyle}>{customer.full_name}</td>
                    <td style={tdStyle}>{customer.email}</td>
                    <td style={tdStyle}>{customer.city}</td>
                    <td style={tdStyle}>{customer.country}</td>
                    <td style={tdStyle}>{customer.id_type}</td>
                    <td style={tdStyle}>{new Date(customer.registration_date).toLocaleDateString()}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => handleCustomerEdit(customer)} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                          Edit
                        </button>
                        <button onClick={() => handleCustomerDelete(customer.customer_id)} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Employees Section */}
        <div style={{ marginTop: "24px", background: "#ffffff", borderRadius: "18px", padding: "28px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)", border: "1px solid #e2e8f0" }}>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "28px", fontWeight: 700, color: "#0f172a" }}>Employees</h2>
          <p style={{ margin: "0 0 24px 0", color: "#64748b", fontSize: "15px" }}>Edit or delete employees.</p>

          {employeeSuccess && (
            <p style={{ color: "#16a34a", fontWeight: 600, fontSize: "14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
              {employeeSuccess}
            </p>
          )}

          {employeeError && (
            <p style={{ color: "#dc2626", fontWeight: 600, fontSize: "14px", marginBottom: "16px" }}>
              {employeeError}
            </p>
          )}

          {/* Edit Form — only shown when editing */}
          {editingEmployeeId && (
            <div ref={employeeFormRef} style={{ marginBottom: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input value={employeeForm.full_name} onChange={(e) => setEmployeeForm((p) => ({ ...p, full_name: e.target.value }))} style={inputStyle} placeholder="Full name" />
                </div>
                <div>
                  <label style={labelStyle}>Hotel</label>
                  <select value={employeeForm.hotel_id} onChange={(e) => setEmployeeForm((p) => ({ ...p, hotel_id: e.target.value }))} style={inputStyle}>
                    <option value="">Select hotel</option>
                    {hotels.map((h) => (
                      <option key={h.hotel_id} value={h.hotel_id}>{h.name} — {h.city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Address</label>
                  <input value={employeeForm.address} onChange={(e) => setEmployeeForm((p) => ({ ...p, address: e.target.value }))} style={inputStyle} placeholder="Address" />
                </div>
                <div>
                  <label style={labelStyle}>City</label>
                  <input value={employeeForm.city} onChange={(e) => setEmployeeForm((p) => ({ ...p, city: e.target.value }))} style={inputStyle} placeholder="City" />
                </div>
                <div>
                  <label style={labelStyle}>State</label>
                  <input value={employeeForm.state} onChange={(e) => setEmployeeForm((p) => ({ ...p, state: e.target.value }))} style={inputStyle} placeholder="State (optional)" />
                </div>
                <div>
                  <label style={labelStyle}>Postal Code</label>
                  <input value={employeeForm.postal_code} onChange={(e) => setEmployeeForm((p) => ({ ...p, postal_code: e.target.value }))} style={inputStyle} placeholder="Postal code (optional)" />
                </div>
                <div>
                  <label style={labelStyle}>Country</label>
                  <input value={employeeForm.country} onChange={(e) => setEmployeeForm((p) => ({ ...p, country: e.target.value }))} style={inputStyle} placeholder="Country" />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={handleEmployeeSubmit} style={{ background: "#2563eb", color: "#ffffff", border: "none", borderRadius: "10px", padding: "12px 24px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
                  Update Employee
                </button>
                <button onClick={() => { setEmployeeForm(emptyEmployee); setEditingEmployeeId(null); setEmployeeError(""); }} style={{ background: "#ffffff", color: "#64748b", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "12px 24px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
                  Cancel Edit
                </button>
              </div>
            </div>
          )}

          {/* Employees Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Hotel</th>
                  <th style={thStyle}>City</th>
                  <th style={thStyle}>Roles</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.employee_id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={tdStyle}>{employee.employee_id}</td>
                    <td style={tdStyle}>{employee.full_name}</td>
                    <td style={tdStyle}>{employee.email}</td>
                    <td style={tdStyle}>{employee.hotel_name}</td>
                    <td style={tdStyle}>{employee.city}</td>
                    <td style={tdStyle}>{employee.roles || "—"}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => handleEmployeeEdit(employee)} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                          Edit
                        </button>
                        <button onClick={() => handleEmployeeDelete(employee.employee_id)} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  fontSize: "15px",
  color: "#0f172a",
  background: "#ffffff",
  boxSizing: "border-box",
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
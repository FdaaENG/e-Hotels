import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Room = {
  room_id: number;
  hotel_id: number;
  hotel_name: string;
  city: string;
  country: string;
  star_category: number;
  price: number;
  capacity: string;
  view_type: string;
  is_extendable: number | boolean;
};

type Booking = {
  id: number;
  record_type: string;
  hotel_name: string;
  city: string;
  room_id: number;
  capacity: string;
  view_type: string;
  price: number | string;
  start_date: string;
  end_date: string;
  status: string;
};

const API_BASE = "http://localhost:3000";

export default function CustomerDashboard() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [city, setCity] = useState("");
  const [capacity, setCapacity] = useState("");
  const [chain, setChain] = useState("");
  const [starCategory, setStarCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsError, setBookingsError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const [cities, setCities] = useState<string[]>([]);
  const [chains, setChains] = useState<{ chain_id: number; name: string }[]>([]);
  const [modal, setModal] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [availableRoomsPerCity, setAvailableRoomsPerCity] = useState<{ city: string; available_rooms: number }[]>([]);
  const [hotelRoomCapacity, setHotelRoomCapacity] = useState<{ hotel_id: number; hotel_name: string; city: string; country: string; total_rooms: number }[]>([]);
  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setCity("");
    setCapacity("");
    setChain("");
    setStarCategory("");
    setMaxPrice("");
    setRooms([]);
    setError("");
    setHasSearched(false);
  };

  const handleSearch = async () => {
    if (startDate && endDate && startDate > endDate) {
      setError("End date must be after start date.");
      setRooms([]);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setHasSearched(true);

      const params = new URLSearchParams();

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (city) params.append("city", city);
      if (capacity) params.append("capacity", capacity);
      if (chain) params.append("chain", chain);
      if (starCategory) params.append("starCategory", starCategory);
      if (maxPrice) params.append("maxPrice", maxPrice);

      const response = await fetch(
        `${API_BASE}/api/rooms/search?${params.toString()}`
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("Backend error:", response.status, text);
        throw new Error("Failed to fetch rooms.");
      }

      const data = await response.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("SEARCH ERROR:", err);
      setError("Failed to fetch rooms. Please try again.");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

 const handleBook = async (roomId: number) => {
  try {
    if (!startDate || !endDate) {
      setModal({ message: "Please select a start date and end date before booking.", type: "error" });
      return;
    }

    const customerId = localStorage.getItem("customer_id");
    if (!customerId) {
      setModal({ message: "Customer not logged in.", type: "error" });
      return;
    }

    const response = await fetch(`${API_BASE}/api/rooms/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, roomId, startDate, endDate }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create booking");
    }

    setModal({ message: "Room booked successfully!", type: "success" });
    handleSearch();
    fetchMyBookings();
  } catch (err) {
    setModal({ message: err instanceof Error ? err.message : "Booking failed", type: "error" });
  }
};

  const fetchMyBookings = async () => {
    try {
      setBookingsError("");

      const customerId = localStorage.getItem("customer_id");

      if (!customerId) {
        setBookingsError("Customer not logged in.");
        setBookings([]);
        return;
      }

      const response = await fetch(
        `${API_BASE}/api/rooms/my-bookings/${customerId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setBookingsError(
        err instanceof Error ? err.message : "Failed to fetch bookings"
      );
      setBookings([]);
    }
  };

const handleCancel = async (id: number) => {
  if (!window.confirm("Are you sure you want to cancel this booking?")) return;

  try {
    setBookingsError("");
    const customerId = localStorage.getItem("customer_id");
    if (!customerId) {
      setBookingsError("Customer not logged in.");
      return;
    }

    const response = await fetch(`${API_BASE}/api/rooms/cancel/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to cancel booking");

    fetchMyBookings();
    handleSearch();
  } catch (err) {
    setBookingsError(err instanceof Error ? err.message : "Cancellation failed");
  }
};

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
  localStorage.removeItem("customer_id");
  navigate("/");
};

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchFilterOptions = async () => {
  try {
    const [citiesRes, chainsRes] = await Promise.all([
      fetch(`${API_BASE}/api/rooms/cities`),
      fetch(`${API_BASE}/api/rooms/chains`),
    ]);
    const citiesData = await citiesRes.json();
    const chainsData = await chainsRes.json();
    setCities(Array.isArray(citiesData) ? citiesData : []);
    setChains(Array.isArray(chainsData) ? chainsData : []);
  } catch (err) {
    console.error("Failed to fetch filter options:", err);
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
  fetchMyBookings();
  fetchFilterOptions();
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
      {modal && (
      <NotificationModal
        message={modal.message}
        type={modal.type}
        onClose={() => setModal(null)}
      />
      )}

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
      <div style={{
        marginBottom: "32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "20px",
      }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, color: "#2563eb", fontWeight: 700, fontSize: "14px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            e-Hotels
          </p>
          <h1 style={{ margin: "10px 0 12px 0", fontSize: "48px", fontWeight: 700, color: "#0f172a" }}>
            Customer Dashboard
          </h1>
          <p style={{ margin: 0, fontSize: "18px", color: "#475569", maxWidth: "760px", lineHeight: 1.6 }}>
            Search available rooms using your preferred dates, location, hotel
            chain, category, and price range.
          </p>
        </div>

        <div style={{ flexShrink: 0, paddingTop: "8px" }}>
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "18px",
              padding: "28px",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <h2
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "32px",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                Search Available Rooms
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: "16px",
                  color: "#64748b",
                }}
              >
                Fill in one or more filters to find matching rooms.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "18px 20px",
              }}
            >
              <div>
                <label style={labelStyle}>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
              <label style={labelStyle}>City / Area</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={inputStyle}
              >
                <option value="">Any</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              </div>

              <div>
                <label style={labelStyle}>Room Capacity</label>
                <select
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Any</option>
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="triple">Triple</option>
                  <option value="suite">Suite</option>
                </select>
              </div>

            <div>
            <label style={labelStyle}>Hotel Chain</label>
            <select
              value={chain}
              onChange={(e) => setChain(e.target.value)}
              style={inputStyle}
            >
              <option value="">Any</option>
              {chains.map((hc) => (
                <option key={hc.chain_id} value={hc.name}>{hc.name}</option>
              ))}
            </select>
            </div>

              <div>
                <label style={labelStyle}>Star Category</label>
                <select
                  value={starCategory}
                  onChange={(e) => setStarCategory(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Any</option>
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Max Price</label>
                <input
                  type="number"
                  placeholder="300"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div
              style={{
                marginTop: "28px",
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={handleSearch}
                disabled={loading}
                style={{
                  background: loading ? "#93c5fd" : "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "14px 24px",
                  fontSize: "16px",
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 8px 20px rgba(37, 99, 235, 0.25)",
                }}
              >
                {loading ? "Searching..." : "Search Rooms"}
              </button>

              <button
                type="button"
                onClick={resetFilters}
                style={{
                  background: "#ffffff",
                  color: "#334155",
                  border: "1px solid #cbd5e1",
                  borderRadius: "12px",
                  padding: "14px 24px",
                  fontSize: "16px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Clear Filters
              </button>
            </div>

            {error && (
              <p
                style={{
                  marginTop: "16px",
                  color: "#dc2626",
                  fontSize: "14px",
                  fontWeight: 600,
                  whiteSpace: "pre-wrap",
                }}
              >
                {error}
              </p>
            )}
            {successMessage && (
              <p
                style={{
                  marginTop: "16px",
                  color: "#16a34a",
                  fontSize: "14px",
                  fontWeight: 600,
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "10px",
                  padding: "12px 16px",
                }}
              >
                {successMessage}
              </p>
            )}
          </div>
          <div
            style={{
              background: "#ffffff",
              borderRadius: "18px",
              padding: "24px",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
              border: "1px solid #e2e8f0",
            }}
          >
            <h2
              style={{
                margin: "0 0 8px 0",
                fontSize: "28px",
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              Search Summary
            </h2>

            <p
              style={{
                margin: "0 0 20px 0",
                color: "#64748b",
                fontSize: "15px",
              }}
            >
              Your selected filters appear here.
            </p>

            <div style={{ display: "grid", gap: "14px" }}>
              <SummaryCard
                title="Dates"
                value={
                  startDate || endDate
                    ? `${startDate || "Not set"} → ${endDate || "Not set"}`
                    : "No dates selected"
                }
              />
              <SummaryCard title="Location" value={city || "Any city"} />
              <SummaryCard
                title="Preferences"
                value={`${capacity || "Any capacity"} • ${
                  chain || "Any chain"
                } • ${starCategory ? `${starCategory}-star` : "Any category"}`}
              />
              <SummaryCard
                title="Budget"
                value={maxPrice ? `$${maxPrice} max` : "No price limit"}
              />
            </div>
          </div>
        </div>
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
          <h2
            style={{
              margin: "0 0 16px 0",
              fontSize: "32px",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            My Bookings
          </h2>

          {bookingsError && (
            <p
              style={{
                margin: 0,
                color: "#dc2626",
                fontSize: "16px",
              }}
            >
              {bookingsError}
            </p>
          )}

          {!bookingsError && bookings.length === 0 && (
            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "16px",
              }}
            >
              No bookings yet.
            </p>
          )}

          {bookings.length > 0 && (
            <div style={{ display: "grid", gap: "16px" }}>
              {bookings.map((booking) => (
            <div
              key={`${booking.record_type}-${booking.id}`}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "18px",
                background: "#f8fafc",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", alignItems: "start" }}>
                <div>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", color: "#0f172a" }}>
                    {booking.hotel_name}
                  </h3>
                  <p style={roomText}>{booking.city}</p>
                  <p style={roomText}>
                    Room #{booking.room_id} • {booking.capacity} • {booking.view_type}
                  </p>
                  <p style={roomText}>
                    {new Date(booking.start_date).toLocaleDateString()} →{" "}
                    {new Date(booking.end_date).toLocaleDateString()}
                  </p>
                  <p
                    style={{
                      margin: "8px 0 0 0",
                      color: booking.status === "active" ? "#16a34a" 
                          : booking.status === "renting" ? "#2563eb"
                          : booking.status === "cancelled" ? "#dc2626"
                          : "#64748b",
                      fontSize: "15px",
                      fontWeight: 700,
                      textTransform: "capitalize",
                    }}
                  >
                    {booking.status}
                  </p>

                  {booking.status === "active" && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      style={{
                        marginTop: "10px",
                        background: "#ffffff",
                        color: "#dc2626",
                        border: "1px solid #dc2626",
                        borderRadius: "10px",
                        padding: "8px 14px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>

                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "#2563eb" }}>
                    ${Number(booking.price).toFixed(2)}
                  </p>
                  <p style={{ margin: "6px 0 0 0", color: "#64748b" }}>
                    {booking.record_type === "renting" ? `Renting #${booking.id}` : `Booking #${booking.id}`}
                  </p>
                </div>
              </div>
            </div>
              ))}
            </div>
          )}
        </div>
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
          <h2
            style={{
              margin: "0 0 16px 0",
              fontSize: "32px",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            Available Rooms
          </h2>

          {loading && (
            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "16px",
              }}
            >
              Searching for available rooms...
            </p>
          )}

          {!loading && !hasSearched && !error && (
            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "16px",
              }}
            >
              No rooms loaded yet. Search results will appear here.
            </p>
          )}

          {!loading && hasSearched && rooms.length === 0 && !error && (
            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "16px",
              }}
            >
              No rooms match your filters.
            </p>
          )}

          {rooms.length > 0 && (
            <div style={{ display: "grid", gap: "16px" }}>
              {rooms.map((room) => (
                <div
                  key={room.room_id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "18px",
                    background: "#f8fafc",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "20px",
                      alignItems: "start",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: "0 0 8px 0",
                          fontSize: "20px",
                          color: "#0f172a",
                        }}
                      >
                        {room.hotel_name}
                      </h3>
                      <p style={roomText}>
                        {room.city}, {room.country}
                      </p>
                      <p style={roomText}>
                        {room.capacity} room • {room.view_type} view
                      </p>
                      <p style={roomText}>
                        {room.star_category}-star hotel •{" "}
                        {room.is_extendable ? "Extendable" : "Not extendable"}
                      </p>
                      <button
                        onClick={() => handleBook(room.room_id)}
                        style={bookBtn}
                      >
                        Book Room
                      </button>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "24px",
                          fontWeight: 700,
                          color: "#2563eb",
                        }}
                      >
                        ${Number(room.price).toFixed(2)}
                      </p>
                      <p style={{ margin: "6px 0 0 0", color: "#64748b" }}>
                        Room #{room.room_id}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "16px",
      }}
    >
      <p
        style={{
          margin: "0 0 6px 0",
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 700,
          color: "#64748b",
        }}
      >
        {title}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: "15px",
          color: "#0f172a",
          lineHeight: 1.5,
        }}
      >
        {value}
      </p>
    </div>
  );
}
function NotificationModal({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "18px",
          padding: "32px",
          maxWidth: "400px",
          width: "90%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: type === "success" ? "#f0fdf4" : "#fef2f2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px auto",
            fontSize: "24px",
          }}
        >
          {type === "success" ? "✓" : "✕"}
        </div>

        <p
          style={{
            margin: "0 0 24px 0",
            fontSize: "16px",
            fontWeight: 600,
            color: "#0f172a",
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>

        <button
          onClick={onClose}
          style={{
            background: type === "success" ? "#16a34a" : "#dc2626",
            color: "#ffffff",
            border: "none",
            borderRadius: "10px",
            padding: "10px 24px",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          OK
        </button>
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
  padding: "14px 14px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  fontSize: "15px",
  color: "#0f172a",
  background: "#ffffff",
  boxSizing: "border-box",
};

const roomText: React.CSSProperties = {
  margin: "4px 0",
  color: "#475569",
  fontSize: "15px",
};

const bookBtn: React.CSSProperties = {
  marginTop: "12px",
  background: "#16a34a",
  color: "#ffffff",
  border: "none",
  borderRadius: "10px",
  padding: "10px 16px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
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
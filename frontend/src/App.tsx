import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/LoginPage';
import RegisterCustomer from './pages/RegisterCustomerPage';
import RegisterEmployee from './pages/RegisterEmployeePage';

function CustomerDashboard() {
  return <h1 className="text-2xl p-8">Customer Dashboard</h1>;
}

function EmployeeDashboard() {
  return <h1 className="text-2xl p-8">Employee Dashboard</h1>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/customer" element={<RegisterCustomer />} />
        <Route path="/register/employee" element={<RegisterEmployee />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
      </Routes>
    </Router>
  );
}
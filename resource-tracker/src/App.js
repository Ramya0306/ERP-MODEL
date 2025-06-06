// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Components/Dashboard';
import Customer from './Components/Customer';
import Order from './Components/Order';
import Invoice from './Components/Invoice'; 
import LogAuditTrail from './Components/AuditPage';
import AppLayout from './Components/Layout'; // includes Navbar, Header, Footer etc.

const App = () => {
  return (
    <Router>
      {/* Only one layout wrapper needed */}
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customer" element={<Customer />} />
          <Route path="/order" element={<Order />} />
          <Route path="/invoice" element={<Invoice />} /> 
          <Route path="/logAuditTrail" element={<LogAuditTrail />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Dashboard from './Components/Dashboard';
import Customer from './Components/Customer';
import Order from './Components/Order';
import Invoice from './Components/Invoice'; 

import { Layout } from 'antd'
const { Content } = Layout;
const App = () => {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Navbar />
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: '#fff',
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customer" element={<Customer />} />
              <Route path="/order" element={<Order />} />
              <Route path="/invoice" element={<Invoice />} /> 
              
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;



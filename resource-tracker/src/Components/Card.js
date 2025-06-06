import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, Statistic } from 'antd';

const MetricCards = () => {
  const [data, setData] = useState({
    customers: 0,
    orders: 0,
    invoices: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all three APIs in parallel
        const [customersRes, ordersRes, invoicesRes] = await Promise.all([
  fetch('http://192.168.0.140:4001/api/customer').then(res => res.json()),
  fetch('http://192.168.0.140:4001/api/orders').then(res => res.json()),
  fetch('http://192.168.0.140:4001/api/invoice').then(res => res.json())
]);


        setData({
          customers: customersRes.length || customersRes.count || 0,
          orders: ordersRes.length || ordersRes.count || 0,
          invoices: invoicesRes.length || invoicesRes.count || 0,
          loading: false,
          error: null
        });
      } catch (err) {
        setData({
          ...data,
          loading: false,
          error: "Failed to load data"
        });
      }
    };

    fetchData();
  }, []);

  const cardStyle = {
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
    textAlign: 'center'
  };

  return (
    <Row gutter={16}>
      {/* Customers Card */}
      <Col span={8}>
        <Card style={cardStyle}>
          {data.loading ? (
            <Spin size="large" />
          ) : data.error ? (
            <p>Error loading customers</p>
          ) : (
            <Statistic
              title="Total Customers"
              value={data.customers}
              valueStyle={{ color: "blue", fontSize: '28px' }}
            />
          )}
        </Card>
      </Col>

      {/* Orders Card */}
      <Col span={8}>
        <Card style={cardStyle}>
          {data.loading ? (
            <Spin size="large" />
          ) : data.error ? (
            <p>Error loading orders</p>
          ) : (
            <Statistic
              title="Total Orders" 
              value={data.orders}
              valueStyle={{ color: 'blue', fontSize: '28px' }}
            />
          )}
        </Card>
      </Col>

      {/* Invoices Card */}
      <Col span={8}>
        <Card style={cardStyle}>
          {data.loading ? (
            <Spin size="large" />
          ) : data.error ? (
            <p>Error loading invoices</p>
          ) : (
            <Statistic
              title="Total Invoices"
              value={data.invoices}
              valueStyle={{ color: 'blue', fontSize: '28px' }}
            />
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default MetricCards;
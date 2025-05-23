import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Input, Button, Row, Col, DatePicker, notification, Spin } from 'antd';
import axios from 'axios';
import { LoadingOutlined } from '@ant-design/icons';
import { getPowerBIUrl } from './powerBiUrls';

const Customer = () => {
  const [customer, setCustomer] = useState({ name: '', contact: '', email: '', date: '' });
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [powerBiUrl, setPowerBiUrlState] = useState(null); 

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://192.168.0.89:8080/api/customer');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.post('http://192.168.0.89:8080/api/customer', customer);
      setCustomers([...customers, response.data]);
      setCustomer({ name: '', contact: '', email: '', date: '' ,customerId: ''});
      notification.success({ message: 'Customer added successfully!' });
      fetchCustomers();
    } catch (error) {
      console.error('Error adding customer:', error);
      notification.error({
        message: 'Error',
        description: 'There was an error. Please try again later.',
        placement: 'top',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Customer ID', dataIndex: 'id', key: 'id' },
    { title: 'Contact', dataIndex: 'contact', key: 'contact' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
  ];

  const handleDateChange = (date, dateString) => {
    setCustomer({ ...customer, date: dateString });
  };

  useEffect(() => {
    fetchCustomers();
    const pieUrl = getPowerBIUrl('customers', 'line');
    setPowerBiUrlState(pieUrl); 
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={16}>
        <Col span={24}>
          <Card title="Add Customer" style={{ marginBottom: '20px' }}>
            <Form layout="inline" onSubmitCapture={handleSubmit}>
              <Form.Item label="Name">
                <Input
                  name="name"
                  value={customer.name}
                  placeholder="Name"
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                />
              </Form.Item>
              <Form.Item label="Contact">
                <Input
                  name="contact"
                  value={customer.contact}
                  placeholder="Contact"
                  onChange={(e) => setCustomer({ ...customer, contact: e.target.value })}
                />
              </Form.Item>
              <Form.Item label="Email">
                <Input
                  name="email"
                  value={customer.email}
                  placeholder="Email"
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                />
              </Form.Item>
              <Form.Item label="Date">
                <DatePicker
                  style={{ width: '100%' }}
                  onChange={handleDateChange}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  {submitting ? 'Adding...' : 'Add Customer'}
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title="Customer Data" style={{ marginBottom: '20px' }}>
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} />} tip="Loading Data...">
              <Table
                columns={columns}
                dataSource={customers}
                rowKey="email"
                pagination={{ pageSize: 5 }}
              />
            </Spin>
          </Card>

          <Card title="Customer Trends ">
            {powerBiUrl ? (
              <iframe
                title="Power BI Customer Line Chart"
                width="1000"
                height="700"
                src='https://app.powerbi.com/view?r=eyJrIjoiMTRiZGM3ZjItZGU4Ny00MDI4LWJhNjMtNWRlMTE2M2Y0YTAxIiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9'
                frameBorder="0"
                allowFullScreen
              />
            ) : (
              <p>No Power BI URL available</p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Customer;

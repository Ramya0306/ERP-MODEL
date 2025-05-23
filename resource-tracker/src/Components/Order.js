import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Input, Button, Row, Col, Select, Spin, notification } from 'antd';
import axios from 'axios';
import { LoadingOutlined } from '@ant-design/icons';
import { getPowerBIUrl } from './powerBiUrls';

const { Option } = Select;

const Order = () => {
  const [order, setOrder] = useState({
    orderId: '',
    amount: '',
    status: '',
  });
  const [customerId, setCustomerId] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [powerBiUrl, setPowerBiUrl] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://192.168.0.89:8080/api/orders');
      setOrders(response.data);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to fetch order data.',
        placement: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrder((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value) => {
    setOrder((prev) => ({ ...prev, status: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      orderId: order.orderId,
      amount: parseFloat(order.amount),
      status: order.status,
    };

    try {
      const response = await axios.post(
        `http://192.168.0.89:8080/api/orders?customerId=${customerId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      notification.success({ message: 'Order added successfully!' });
      setOrder({ orderId: '', amount: '', status: '' });
      setCustomerId('');
      fetchOrders();
    } catch (error) {
      console.error('Order submission failed:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to add new order.',
        placement: 'top',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: 'Order ID', dataIndex: 'orderId', key: 'orderId' },
    {
      title: 'Customer ID',
      dataIndex: ['customer', 'id'],
      key: 'customerId',
    },
    { title: 'Total Amount', dataIndex: 'amount', key: 'amount' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
  ];

  useEffect(() => {
    fetchOrders();
    const pieUrl = getPowerBIUrl('orders', 'pie');
    setPowerBiUrl(pieUrl);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={16}>
        <Col span={24}>
          <Card title="Add New Order" style={{ marginBottom: '20px' }}>
            <Form layout="inline" onSubmitCapture={handleSubmit}>
              <Form.Item label="Order ID">
                <Input
                  name="orderId"
                  placeholder="Order ID"
                  value={order.orderId}
                  onChange={handleChange}
                />
              </Form.Item>
              <Form.Item label="Customer ID">
                <Input
                  name="customerId"
                  placeholder="Customer ID"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                />
              </Form.Item>
              <Form.Item label="Amount">
                <Input
                  name="amount"
                  placeholder="Total Amount"
                  value={order.amount}
                  onChange={handleChange}
                />
              </Form.Item>
              <Form.Item label="Status">
                <Select
                  placeholder="Status"
                  value={order.status}
                  onChange={handleStatusChange}
                  style={{ width: 120 }}
                >
                  <Option value="Pending">Pending</Option>
                  <Option value="Completed">Completed</Option>
                  <Option value="Cancelled">Cancelled</Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  {submitting ? 'Adding...' : 'Add Order'}
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title="Order Data" style={{ marginBottom: '20px' }}>
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} />} tip="Loading Data...">
              <Table columns={columns} dataSource={orders} rowKey="orderId" pagination={{ pageSize: 5 }} />
            </Spin>
          </Card>

          <Card title="Order Analytics " style={{ marginBottom: '20px' }}>
            {powerBiUrl ? (
              <iframe
                title="Power BI Order Pie Chart"
                width="900"
                height="700"
                src='https://app.powerbi.com/view?r=eyJrIjoiMWFiNDRkNGEtYWQxMC00MzhmLWE5M2ItM2FjNzNiNTM4NjIyIiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9'
                frameBorder="0"
                allowFullScreen
              />
            ) : (
              <p>No Power BI report available</p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Order;



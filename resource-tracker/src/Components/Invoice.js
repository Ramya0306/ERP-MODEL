import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Input, Button, Row, Col, DatePicker, message, Spin } from 'antd';
import axios from 'axios';
import moment from 'moment';
import { LoadingOutlined } from '@ant-design/icons';
import { getPowerBIUrl } from './powerBiUrls';

const Invoice = () => {
  const [invoice, setInvoice] = useState({
    
    amount: '',
    dueMonth: '',
    customerId: ''
  });
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [powerBiUrl, setPowerBiUrl] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://192.168.0.89:8080/api/invoice');
      setInvoices(response.data);
    } catch {
      message.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!invoice.customerId) {
      message.warning("Customer ID is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
       
        amount: invoice.amount,
        dueMonth: invoice.dueMonth,
 
      };

      const response = await axios.post(
        `http://192.168.0.89:8080/api/invoice?customerId=${invoice.customerId}`,
        payload
      );
      setInvoices([...invoices, response.data]);
      setInvoice({ invoiceId: '', amount: '', dueMonth: '', customerId: '' });
      message.success('Invoice added successfully!');
      fetchInvoices();
    } catch {
      message.error('Failed to add invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: 'Invoice ID', dataIndex: 'invoiceId', key: 'invoiceId' },
    { title: 'Customer ID', dataIndex: ['customer', 'id'], key: 'customer.id' },

    { title: 'Amount', dataIndex: 'amount', key: 'amount' },
    { title: 'Due Date', dataIndex: 'dueMonth', key: 'dueMonth' }, 
  ];

  const handleDateChange = (date, dateString) => {
    setInvoice({ ...invoice, dueMonth: dateString });
  };

  useEffect(() => {
    fetchInvoices();
    const lineUrl = getPowerBIUrl('invoices', 'line');
    setPowerBiUrl(lineUrl);
  }, []);

  return (
    <Row gutter={16}>
      <Col span={24}>
        <Card title="Add Invoice">
          <Form layout="inline" onFinish={handleSubmit}>
            
            <Form.Item label="Customer ID">
              <Input
                placeholder="Customer ID"
                value={invoice.customerId}
                onChange={(e) => setInvoice({ ...invoice, customerId: e.target.value })}
              />
            </Form.Item>
            <Form.Item label="Amount">
              <Input
                placeholder="Amount"
                value={invoice.amount}
                onChange={(e) => setInvoice({ ...invoice, amount: e.target.value })}
              />
            </Form.Item>
            <Form.Item label="Due Date">
              <DatePicker
               
                onChange={handleDateChange}
                format="YYYY-MM-DD"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {submitting ? 'Adding...' : 'Add Invoice'}
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Invoice Table" style={{ marginTop: 20 }}>
          <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} />} tip="Loading Data...">
            <Table columns={columns} dataSource={invoices} rowKey="invoiceId"  pagination={{ pageSize: 5 }} />
          </Spin>
        </Card>

        <Card title="Invoice Trends (Line Chart)" style={{ marginTop: 20 }}>
          {powerBiUrl ? (
            <iframe
              title="Power BI Invoice Line Chart"
              width="900"
              height="700"
              src={powerBiUrl}
              frameBorder="0"
              allowFullScreen
            />
          ) : (
            <p>No Power BI report available</p>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default Invoice;


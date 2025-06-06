import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Form,
  Input,
  Button,
  Row,
  Col,
  DatePicker,
  notification,
  Spin,
} from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import { LoadingOutlined, EditOutlined, DeleteOutlined,TableOutlined,
  LineChartOutlined,FormOutlined } from '@ant-design/icons';
import { getPowerBIUrl } from './powerBiUrls';

const EditableCell = ({
  editing,
  dataIndex,
  title,
  record,
  form,
  children,
  ...restProps
}) => {
  const onPressEnter = () => {
    form.submit();
  };

  let inputNode = null;

  if (dataIndex === 'dueMonth') {
    inputNode = (
      <DatePicker
        format="YYYY-MM-DD"
        onPressEnter={onPressEnter}
        onOpenChange={(open) => {
          if (!open) {
            form.submit();
          }
        }}
      />
    );
  } else if (dataIndex === 'amount') {
    inputNode = <Input type="number" onPressEnter={onPressEnter} />;
  } else {
    inputNode = <Input onPressEnter={onPressEnter} />;
  }

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: dataIndex !== 'dueMonth',
              message: `Please input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const Invoice = () => {
  const [form] = Form.useForm();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [powerBiUrl, setPowerBiUrl] = useState(null);
  const [editingId, setEditingId] = useState('');
  const [invoice, setInvoice] = useState({
    invoiceId: '',
    amount: '',
    supplierName:'',
    description:'',
    dueMonth: null,
  });
  const [customerId, setCustomerId] = useState('');

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://192.168.0.140:4001/api/invoice');
      setInvoices(response.data);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to fetch invoices',
        placement: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    const reportUrl = getPowerBIUrl('invoices', 'line'); // example report type
    setPowerBiUrl(reportUrl);
  }, []);

  const isEditing = (record) => record.invoiceId === editingId;

  const edit = (record) => {
    form.setFieldsValue({
      amount: record.amount,
      dueMonth: record.dueMonth ? dayjs(record.dueMonth) : null,
    });
    setEditingId(record.invoiceId);
  };

  const save = async (values) => {
    try {
      const originalInvoice = invoices.find((inv) => inv.invoiceId === editingId);
      if (!originalInvoice) {
        notification.error({ message: 'Invoice not found!' });
        setEditingId('');
        return;
      }

      const updatedInvoice = {
        ...originalInvoice,
        supplierName:values.supplierName,
        description:values.description,
        amount: parseFloat(values.amount),
        dueMonth: values.dueMonth ? values.dueMonth.format('YYYY-MM-DD') : null,
      };

      // Assuming your backend requires customerId as query param for update
      const customerIdForUpdate = originalInvoice.customer?.id;

      const response = await axios.put(
        `http://192.168.0.140:4001/api/invoice/${editingId}?customerId=${customerIdForUpdate}`,
        updatedInvoice,
        { headers: { 'Content-Type': 'application/json' } }
      );

      setInvoices(invoices.map((inv) =>
        inv.invoiceId === editingId ? response.data : inv
      ));
      setEditingId('');
      notification.success({ message: 'Invoice updated successfully!' });
    } catch (err) {
      console.error('Failed to save invoice:', err);
      notification.error({
        message: 'Update failed',
        description: err?.response?.data?.message || 'Could not update invoice',
      });
    }
  };

  const handleDelete = async (invoiceId) => {
    try {
      await axios.delete(`http://192.168.0.140:4001/api/invoice/${invoiceId}`);
      setInvoices((prev) => prev.filter((inv) => inv.invoiceId !== invoiceId));
      notification.success({ message: 'Invoice deleted successfully!' });
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to delete invoice',
        placement: 'top',
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvoice((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setInvoice((prev) => ({ ...prev, dueMonth: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      amount: parseFloat(invoice.amount),
      dueMonth: invoice.dueMonth ? invoice.dueMonth.format('YYYY-MM-DD') : null,
    };

    try {
      const response = await axios.post(
        `http://192.168.0.140:4001/api/invoice?customerId=${customerId}`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      notification.success({ message: 'Invoice added successfully!' });
      setInvoice({ invoiceId: '', amount: '', dueMonth: null });
      setCustomerId('');
      fetchInvoices();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to add new invoice',
        placement: 'top',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Invoice ID',
      dataIndex: 'invoiceId',
      key: 'invoiceId',
      editable: false,
    },
    {
      title: 'Customer ID',
      dataIndex: ['customer', 'id'],
      key: 'customerId',
      sorter: (a, b) => a.customerId - b.customerId,
      editable: false,
      render: (_, record) => record.customer?.id || '',
    },
    {
      title: 'Supplier Name',
      dataIndex: 'supplierName',
      key: 'supplierName',
      editable: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      editable: true,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      editable: true,
    },
    {
      title: 'DueMonth',
      dataIndex: 'dueMonth',
      key: 'dueMonth',
      editable: true,
      sorter: (a, b) => new Date(a.dueMonth) - new Date(b.dueMonth),
      render: (text) => (text ? dayjs(text).format('YYYY-MM-DD') : ''),
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? null : (
          <span style={{ display: 'flex', gap: '10px' }}>
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => edit(record)}
            />
            <DeleteOutlined
              style={{ color: '#ff4d4f', cursor: 'pointer' }}
              onClick={() => handleDelete(record.invoiceId)}
            />
          </span>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) return col;

    return {
      ...col,
      onCell: (record) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
        form,
      }),
    };
  });

  return (
    <div style={{ padding: '20px' }}>
        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} md={24} lg={24}>
          <Card title={
            <span>
              <FormOutlined style={{ marginRight: 8 }}/>
              Add New Invoice
            </span>} style={{ marginBottom: '20px' ,background: "#f8f9fa"}}>
            <Form layout="vertical" onSubmitCapture={handleSubmit}>
              <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="Customer ID">
                <Input
                  name="customerId"
                  placeholder="Customer ID"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                />
              </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="Supplier Name">
                <Input
                
                  name="supplierName"
                  placeholder="Supplier Name"
                  value={invoice.supplierName}
                  onChange={handleChange}
                />
                </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item label="Description">
                <Input
                
                  name="description"
                  placeholder="Description"
                  value={invoice.description}
                  onChange={handleChange}
                />
                </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="Amount">
                <Input
                
                  name="amount"
                  placeholder="Amount"
                  value={invoice.amount}
                  onChange={handleChange}
                />
              </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="Due Month">
                <DatePicker
                  style={{ width: '100%' }}
                  value={invoice.dueMonth}
                  onChange={handleDateChange}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item style={{ marginTop: 30 }}>
                <Button type="primary" htmlType="submit" loading={submitting} block>
                  {submitting ? 'Adding...' : 'Add Invoice'}
                </Button>
              </Form.Item>
              </Col>
              </Row>
            </Form>
          </Card>
          </Col>
           <Col xs={24}>
          <Card title={
            <span>
              <TableOutlined style={{ marginRight: 8 }}/>
            Invoice Data
            </span>} style={{ marginBottom: '20px' ,background: "#f8f9fa"}}>
            <Spin
              spinning={loading}
              indicator={<LoadingOutlined style={{ fontSize: 24 }} />}
              tip="Loading Data..."
            >
              <Form form={form} component={false} onFinish={save}>
                <Table
                  components={{
                    body: {
                      cell: EditableCell,
                    },
                  }}
                  bordered
                  dataSource={invoices}
                  columns={mergedColumns}
                  rowKey="invoiceId"
                  pagination={{ pageSize: 5 }}
                />
              </Form>
            </Spin>
          </Card>
          </Col>
           <Col xs={24}>
          <Card title={
            <span>
              <LineChartOutlined style={{ marginRight: 8 }}/>
              Invoice Analytics
            </span>} style={{ marginBottom: '20px',background: "#f8f9fa" }}>
            {powerBiUrl ? (
              <iframe
                title="Power BI Invoice Report"
                width="900"
                height="700"
                src='https://app.powerbi.com/view?r=eyJrIjoiYjFlMzJmZTUtMDE3ZC00YmI4LWIxYjEtNDkwMGQyNTM2ZmY3IiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9'
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

export default Invoice;

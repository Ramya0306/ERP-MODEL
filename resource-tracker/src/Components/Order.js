import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Form,
  Input,
  Button,
  Row,
  Col,
  Select,
  Spin,
  notification,
} from 'antd';
import axios from 'axios';
import { LoadingOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getPowerBIUrl } from './powerBiUrls';

const { Option } = Select;

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = dataIndex === 'status' ? (
    <Select>
      <Option value="Pending">Pending</Option>
      <Option value="Completed">Completed</Option>
      <Option value="Cancelled">Cancelled</Option>
    </Select>
  ) : inputType === 'number' ? (
    <Input type="number" />
  ) : (
    <Input />
  );

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
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

const Order = () => {
  const [form] = Form.useForm();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [order, setOrder] = useState({
    orderId: '',
    amount: '',
    quantity: '',
    product: '',
    status: '',
  });
  const [powerBiUrl, setPowerBiUrl] = useState(null);

  const isEditing = (record) => record.orderId === editingId;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://192.168.0.140:4001/api/orders');
      setOrders(response.data);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to fetch orders',
        placement: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    setPowerBiUrl(getPowerBIUrl('orders', 'pie'));
  }, []);

  const edit = (record) => {
    form.setFieldsValue({
      amount: record.amount,
      status: record.status,
      quantity: record.quantity,
      product: record.product,
    });
    setEditingId(record.orderId);
  };

const save = async () => {
  try {
    const row = await form.validateFields();
    const originalOrder = orders.find((o) => o.orderId === editingId);

    const updatedOrder = {
      orderId: originalOrder.orderId,
      amount: parseFloat(row.amount),
      quantity: row.quantity,
      status: row.status,
      product: row.product,
    };

    const customerId = originalOrder.customer?.id;

    const response = await axios.put(
      `http://192.168.0.140:4001/api/orders/${editingId}?customerId=${customerId}`,
      updatedOrder,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    setOrders((prev) =>
      prev.map((order) =>
        order.orderId === editingId ? response.data : order
      )
    );
    setEditingId('');
    notification.success({ message: 'Order updated successfully!' });
  } catch (error) {
    console.error("Update failed:", error);
    notification.error({
      message: 'Update failed',
      description: error?.response?.data?.message || 'Could not update order',
      placement: 'top',
    });
  }
};


  const handleDelete = async (orderId) => {
    try {
      await axios.delete(`http://192.168.0.140:4001/api/orders/${orderId}`);
      setOrders((prev) => prev.filter((order) => order.orderId !== orderId));
      notification.success({ message: 'Order deleted successfully!' });
    } catch (error) {
      notification.error({
        message: 'Delete failed',
        description: 'Could not delete order',
        placement: 'top',
      });
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
      quantity: order.quantity,
      product: order.product,
    };

    try {
      await axios.post(
        `http://192.168.0.140:4001/api/orders?customerId=${customerId}`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      notification.success({ message: 'Order added successfully!' });
      setOrder({ orderId: '', amount: '', status: '', quantity: '', product: '' });
      setCustomerId('');
      fetchOrders();
    } catch (error) {
      notification.error({
        message: 'Creation failed',
        description: 'Could not add order',
        placement: 'top',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      editable: false,
    },
    {
      title: 'Customer ID',
      
      editable: false,
      render: (_, record) => {
    
    console.log('Rendering customer:', record.customer);
    return record.customer?.id ?? 'Null';
    },
  },
    {
      title: 'Product',
      dataIndex: 'product',
      editable: true,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      editable: true,
    },
    {
      title: 'Total Amount',
      dataIndex: 'amount',
      editable: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      editable: true,
    },
    {
      title: '',
      dataIndex: 'actions',
      render: (_, record) => {
        const editable = isEditing(record);
        return (
          <span style={{ display: 'flex', gap: '10px' }}>
            {!editable && (
              <EditOutlined
                style={{ color: '#1890ff', cursor: 'pointer' }}
                onClick={() => edit(record)}
              />
            )}
            <DeleteOutlined
              style={{ color: '#ff4d4f', cursor: 'pointer' }}
              onClick={() => handleDelete(record.orderId)}
            />
          </span>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) =>
    !col.editable
      ? col
      : {
          ...col,
          onCell: (record) => ({
            record,
            inputType: col.dataIndex === 'amount' ? 'number' : 'text',
            dataIndex: col.dataIndex,
            title: col.title,
            editing: isEditing(record),
          }),
        }
  );

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={16}>
        <Col span={24}>
          <Card title="Add New Order" style={{ marginBottom: '20px' }}>
            <Form
              layout="inline"
              onSubmitCapture={handleSubmit}
              style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', alignItems: 'center' }}
            >
              <Form.Item label="Customer ID">
                <Input
                  style={{ width: 120 }}
                  name="customerId"
                  placeholder="Customer ID"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                />
              </Form.Item>
              <Form.Item label="Product">
                <Input
                  style={{ width: 120 }}
                  name="product"
                  placeholder="Product"
                  value={order.product}
                  onChange={handleChange}
                />
              </Form.Item>
              <Form.Item label="Quantity">
                <Input
                  style={{ width: 120 }}
                  name="quantity"
                  placeholder="Quantity"
                  value={order.quantity}
                  onChange={handleChange}
                />
              </Form.Item>
              <Form.Item label="Amount">
                <Input
                  style={{ width: 120 }}
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
            <Spin
              spinning={loading}
              indicator={<LoadingOutlined style={{ fontSize: 24 }} />}
              tip="Loading Data..."
            >
              <Form form={form} component={false}>
                <Table
                  components={{ body: { cell: EditableCell } }}
                  bordered
                  dataSource={orders}
                  columns={mergedColumns}
                  rowKey="orderId"
                  pagination={{ pageSize: 5 }}
                  onRow={(record) => ({
                    onKeyDown: (event) => {
                      if (event.key === 'Enter' && isEditing(record)) save();
                    },
                  })}
                />
              </Form>
            </Spin>
          </Card>

          <Card title="Order Analytics" style={{ marginBottom: '20px' }}>
            {powerBiUrl ? (
              <iframe
                title="Power BI Order Pie Chart"
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
    </div>
  );
};

export default Order;

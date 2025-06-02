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
import  logAuditTrail  from './AuditPage';

const { Option } = Select;

const Order = () => {
  const [form] = Form.useForm();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [powerBiUrl, setPowerBiUrl] = useState(null);
  const [editingKey, setEditingKey] = useState('');
  const [order, setOrder] = useState({
    orderId: '',
    amount: '',
    status: '',
  });
  const [customerId, setCustomerId] = useState('');
  const [ipAddress, setIpAddress] = useState('');

  const fetchIp = async () => {
    try {
      const res = await axios.get("https://api.ipify.org?format=json");
      setIpAddress(res.data.ip);
    } catch (err) {
      console.warn("Could not fetch IP address:", err);
      setIpAddress("unknown");
    }
  };

  const isEditing = (record) => record.orderId === editingKey;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://192.168.0.140:8080/api/orders');
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

  useEffect(() => {
    fetchIp();
    fetchOrders();
    const pieUrl = getPowerBIUrl('orders', 'pie');
    setPowerBiUrl(pieUrl);
  }, []);

  const edit = (record) => {
    form.setFieldsValue({
      amount: '',
      status: '',
      ...record,
    });
    setEditingKey(record.orderId);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (orderId) => {
    try {
      const row = await form.validateFields();

      const newData = [...orders];
      const index = newData.findIndex((item) => orderId === item.orderId);

      if (index > -1) {
        const item = newData[index];
        const oldData = { ...item };
        const updated = { ...item, ...row };

        await axios.put(
          `http://192.168.0.140:8080/api/orders/${orderId}`,
          updated,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        newData.splice(index, 1, updated);
        setOrders(newData);
        setEditingKey('');
        notification.success({ message: 'Order updated successfully!' });

        await logAuditTrail({
          ipAddress,
          action: `Updated order with ID ${orderId}`,
          endpoint: `/api/orders/${orderId}`,
          method: "UPDATE",
          entityName: "Order",
          oldData: oldData,
          newData: updated,
        });
      } else {
        setEditingKey('');
      }
    } catch (error) {
      console.log('Save failed:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to update order.',
        placement: 'top',
      });
    }
  };

  const handleDelete = async (orderId) => {
    try {
      const orderToDelete = orders.find(order => order.orderId === orderId);
      await axios.delete(`http://192.168.0.140:8080/api/orders/${orderId}`);
      setOrders((prev) => prev.filter((order) => order.orderId !== orderId));
      notification.success({ message: 'Order deleted successfully!' });

      await logAuditTrail({
        ipAddress,
        action: `Deleted order with ID ${orderId}`,
        endpoint: `/api/orders/${orderId}`,
        method: "DELETE",
        entityName: "Order",
        oldData: orderToDelete,
        newData: null,
      });
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to delete order.',
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
    };

    try {
      const response = await axios.post(
        `http://192.168.0.140:8080/api/orders?customerId=${customerId}`,
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

      await logAuditTrail({
        ipAddress,
        action: "Created new order",
        endpoint: "/api/orders",
        method: "CREATE",
        entityName: "Order",
        oldData: null,
        newData: payload,
      });
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
    let inputNode;
    if (dataIndex === 'status') {
      inputNode = (
        <Select>
          <Option value="Pending">Pending</Option>
          <Option value="Completed">Completed</Option>
          <Option value="Cancelled">Cancelled</Option>
        </Select>
      );
    } else if (inputType === 'number') {
      inputNode = <Input type="number" />;
    } else {
      inputNode = <Input />;
    }

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

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      editable: false,
    },
    {
      title: 'Customer ID',
      dataIndex: ['customer', 'id'],
      key: 'customerId',
      editable: false,
      render: (_, record) => record.customer?.id || '',
    },
    {
      title: 'Total Amount',
      dataIndex: 'amount',
      key: 'amount',
      editable: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      editable: true,
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <Form.Item
              name="status"
              style={{ margin: 0 }}
              rules={[{ required: true, message: 'Please select status!' }]}
            >
              <Select>
                <Option value="Pending">Pending</Option>
                <Option value="Completed">Completed</Option>
                <Option value="Cancelled">Cancelled</Option>
              </Select>
            </Form.Item>
          );
        } else {
          return text;
        }
      },
    },
    {
      title: '',
      dataIndex: 'actions',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span style={{ display: "flex", gap: "10px" }}>
            <Button
              onClick={() => save(record.orderId)}
              type="link"
              icon={<EditOutlined style={{ color: "#1890ff" }} />}
            />
            <Button
              onClick={cancel}
              type="link"
              icon={<DeleteOutlined style={{ color: "#ff4d4f" }} />}
            />
          </span>
        ) : (
          <span style={{ display: "flex", gap: "10px" }}>
            <EditOutlined
              style={{ color: "#1890ff", cursor: "pointer" }}
              onClick={() => edit(record)}
              disabled={editingKey !== ''}
            />
            <DeleteOutlined
              style={{ color: "#ff4d4f", cursor: "pointer" }}
              onClick={() => handleDelete(record.orderId)}
              disabled={editingKey !== ''}
            />
          </span>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === 'amount' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

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
            <Spin
              spinning={loading}
              indicator={<LoadingOutlined style={{ fontSize: 24 }} />}
              tip="Loading Data..."
            >
              <Form form={form} component={false}>
                <Table
                  components={{
                    body: {
                      cell: EditableCell,
                    },
                  }}
                  bordered
                  dataSource={orders}
                  columns={mergedColumns}
                  rowKey="orderId"
                  pagination={{ pageSize: 5 }}
                  onRow={(record) => ({
                    onKeyDown: (event) => {
                      if (event.key === 'Enter' && isEditing(record)) {
                        save(record.orderId);
                      }
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
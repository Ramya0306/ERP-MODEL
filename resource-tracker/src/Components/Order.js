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
import logAuditTrail from './AuditPage';

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

let save;

const Order = () => {
  const [form] = Form.useForm();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [powerBiUrl, setPowerBiUrl] = useState(null);
  const [editingId, setEditingId] = useState('');
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

  const isEditing = (record) => record.orderId === editingId;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://192.168.0.140:4001/api/orders');
      setOrders(response.data);
    } catch (error) {
      notification.error({
        message: 'Error',
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
      amount: record.amount,
      status: record.status,
    });
    setEditingId(record.orderId);
  };

  save = async () => {
    try {
      const row = await form.validateFields();
      const originalOrder = orders.find((o) => o.orderId === editingId);

      const changes = {};
      const updatedOrder = { ...originalOrder };

      // Check for changes in all fields
      const fieldsToCheck = ['amount', 'status'];
      fieldsToCheck.forEach(field => {
        if (row[field] !== originalOrder[field]) {
          changes[field] = row[field];
          updatedOrder[field] = row[field];
        }
      });

      // Always assign full old/new data for logging, regardless of changes
      const oldData = { ...originalOrder };
      const newData = { ...updatedOrder };

      if (Object.keys(changes).length > 0) {
        const response = await axios.put(
          `http://192.168.0.140:4001/api/orders/${editingId}`,
          updatedOrder,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        setOrders(orders.map((item) =>
          item.orderId === editingId ? response.data : item
        ));
        setEditingId("");
        notification.success({ message: 'Order updated successfully!' });
      } else {
        notification.info({ message: "No changes detected" });
        setEditingId("");
      }

      // Log audit trail regardless of UI update
      await logAuditTrail({
        ipAddress,
        action: `Updated order ID ${editingId}`,
        endpoint: `/api/orders/${editingId}`,
        method: "PUT",
        entityName: "Order",
        oldData: JSON.stringify(oldData),
        newData: JSON.stringify({
          orderId: editingId,
          amount: row.amount || originalOrder.amount,
          status: row.status || originalOrder.status,
          customer: originalOrder.customer // Preserve customer data
        }),
      });

    } catch (errInfo) {
      console.error("Failed to save updated order:", errInfo);
    }
  };

  const handleDelete = async (orderId) => {
    try {
      const orderToDelete = orders.find(order => order.orderId === orderId);
      await axios.delete(`http://192.168.0.140:4001/api/orders/${orderId}`);
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
        `http://192.168.0.140:4001/api/orders?customerId=${customerId}`,
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
        method: "POST",
        entityName: "Order",
        oldData: null,
        newData: response.data,
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
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      render: (_, record) => {
        const editable = isEditing(record);
        return (
          <span style={{ display: "flex", gap: "10px" }}>
            {!editable && (
              <EditOutlined
                style={{ color: "#1890ff", cursor: "pointer" }}
                onClick={() => edit(record)}
              />
            )}
            <DeleteOutlined
              style={{ color: "#ff4d4f", cursor: "pointer" }}
              onClick={() => handleDelete(record.orderId)}
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
                        save();
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
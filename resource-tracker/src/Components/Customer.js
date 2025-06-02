import React, { useState, useEffect } from "react";
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
} from "antd";
import {
  LoadingOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { getPowerBIUrl } from "./powerBiUrls";
import dayjs from "dayjs";
import logAuditTrail from "./AuditPage";

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
  return (
    <td {...restProps}>
      {editing ? (
        dataIndex === "date" ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[{ required: true, message: `Please Input ${title}!` }]}
          >
            <DatePicker
              format="YYYY-MM-DD"
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
              }}
            />
          </Form.Item>
        ) : (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[{ required: true, message: `Please Input ${title}!` }]}
          >
            <Input onPressEnter={save} />
          </Form.Item>
        )
      ) : (
        children
      )}
    </td>
  );
};

let save;

const Customer = () => {
  const [customer, setCustomer] = useState({
    name: "",
    contact: "",
    email: "",
    date: "",
    location: "",
  });
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState("");
  const [powerBiUrl, setPowerBiUrlState] = useState(null);
  const [ipAddress, setIpAddress] = useState("");

  const fetchIp = async () => {
    try {
      const res = await axios.get("https://api.ipify.org?format=json");
      setIpAddress(res.data.ip);
    } catch (err) {
      console.warn("Could not fetch IP address:", err);
      setIpAddress("unknown");
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://192.168.0.140:8080/api/customer"
      );
      setCustomers(response.data);
      logAuditTrail({
        action: "Viewed Customer Table",
        endpoint: "/api/customer",
        method: "READ",
        entityName: "Customer",
      });
    } catch (error) {
      console.error("Error fetching customer data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.post(
        "http://192.168.0.140:8080/api/customer",
        customer
      );
      setCustomers([...customers, response.data]);
      notification.success({ message: "Customer added successfully!" });
      fetchCustomers();

      logAuditTrail({
        action: "Created new customer",
        endpoint: "/api/customer",
        method: "CREATE",
        entityName: "Customer",
      });

      setCustomer({ name: "", contact: "", email: "", date: "", location: "" });
    } catch (error) {
      console.error("Error adding customer:", error);
      notification.error({
        message: "Error",
        description: "There was an error. Please try again later.",
        placement: "top",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isEditing = (record) => record.id === editingId;

  const edit = (record) => {
    form.setFieldsValue({
      name: record.name,
      contact: record.contact,
      email: record.email,
      date: record.date ? dayjs(record.date) : null,
      location: record.location,
    });
    setEditingId(record.id);
  };

  save = async () => {
    try {
      const row = await form.validateFields();
      const original = customers.find((c) => c.id === editingId);
      const updatedCustomer = {
        ...row,
        id: editingId,
        date: row.date ? row.date.format("YYYY-MM-DD") : "",
      };

      await axios.put(
        `http://192.168.0.140:8080/api/customer/${editingId}`,
        updatedCustomer
      );

      const newData = customers.map((item) =>
        item.id === editingId ? { ...item, ...updatedCustomer } : item
      );
      setCustomers(newData);
      setEditingId("");
      notification.success({ message: "Customer updated successfully!" });

      logAuditTrail({
        action: `Updated customer with ID ${editingId}`,
        endpoint: `/api/customer/${editingId}`,
        method: "UPDATE",
        entityName: "Customer",
      });
    } catch (errInfo) {
      console.error("Validate Failed:", errInfo);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://192.168.0.140:8080/api/customer/${id}`);
      setCustomers(customers.filter((c) => c.id !== id));
      notification.success({ message: "Customer deleted and audit logged!" });

      logAuditTrail({
        action: `Deleted customer with ID ${id}`,
        endpoint: `/api/customer/${id}`,
        method: "DELETE",
        entityName: "Customer",
      });
    } catch (err) {
      console.error("Error deleting:", err);
      notification.error({
        message: "Delete failed",
        description: "Could not delete customer",
      });
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name", editable: true },
    { title: "Customer ID", dataIndex: "id", key: "id" },
    { title: "Contact", dataIndex: "contact", key: "contact", editable: true },
    { title: "Email", dataIndex: "email", key: "email", editable: true },
    { title: "Date", dataIndex: "date", key: "date", editable: true },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      editable: true,
      render: (text, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="location"
            style={{ margin: 0 }}
            rules={[{ required: true, message: "Please Input Location!" }]}
          >
            <Input onPressEnter={save} />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: "",
      key: "actions",
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
              onClick={() => handleDelete(record.id)}
            />
          </span>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable || col.dataIndex === "location") {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        dataIndex: col.dataIndex,
        editing: isEditing(record),
      }),
    };
  });

  const handleDateChange = (date, dateString) => {
    setCustomer({ ...customer, date: dateString });
  };

  useEffect(() => {
    fetchCustomers();
    fetchIp();
    const pieUrl = getPowerBIUrl("customers", "line");
    setPowerBiUrlState(pieUrl);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={18}>
        <Col span={24}>
          <Card title="Add Customer" style={{ marginBottom: "20px" }}>
            <Form
              layout="inline"
              onSubmitCapture={handleSubmit}
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "nowrap",
                alignItems: "center",
              }}
            >
              <Form.Item label="Name:" style={{ marginBottom: 0 }}>
                <Input
                  style={{ width: 120 }}
                  value={customer.name}
                  onChange={(e) =>
                    setCustomer({ ...customer, name: e.target.value })
                  }
                />
              </Form.Item>
              <Form.Item label="Contact:" style={{ marginBottom: 0 }}>
                <Input
                  style={{ width: 120 }}
                  value={customer.contact}
                  onChange={(e) =>
                    setCustomer({ ...customer, contact: e.target.value })
                  }
                />
              </Form.Item>
              <Form.Item label="Email:" style={{ marginBottom: 0 }}>
                <Input
                  style={{ width: 160 }}
                  value={customer.email}
                  onChange={(e) =>
                    setCustomer({ ...customer, email: e.target.value })
                  }
                />
              </Form.Item>
              <Form.Item label="Date:" style={{ marginBottom: 0 }}>
                <DatePicker
                  style={{ width: 130 }}
                  format="YYYY-MM-DD"
                  onChange={handleDateChange}
                />
              </Form.Item>
              <Form.Item label="Location:" style={{ marginBottom: 0 }}>
                <Input
                  style={{ width: 130 }}
                  value={customer.location}
                  onChange={(e) =>
                    setCustomer({ ...customer, location: e.target.value })
                  }
                />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  {submitting ? "Adding..." : "Add Customer"}
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title="Customer Data" style={{ marginBottom: "20px" }}>
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
                  columns={mergedColumns}
                  dataSource={customers}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                />
              </Form>
            </Spin>
          </Card>

          <Card title="Customer Trends">
            {powerBiUrl ? (
              <iframe
                title="Power BI Customer Line Chart"
                width="1000"
                height="700"
                src={powerBiUrl}
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

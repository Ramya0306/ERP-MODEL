import React, { useState, useEffect, createContext, useContext } from "react";
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

const SaveContext = createContext(null);
const CancelContext = createContext(null);

const EditableCell = ({
  editing,
  dataIndex,
  title,
  record,
  index,
  children,
  ...restProps
}) => {
  const save = useContext(SaveContext);
  const cancel = useContext(CancelContext);

  const inputRef = React.useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      save();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  };

  let inputNode = null;

  if (editing) {
    if (dataIndex === "date") {
      inputNode = (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[{ required: true, message: `Please Input ${title}!` }]}
        >
          <DatePicker
            format="YYYY-MM-DD"
            style={{ width: "100%" }}
            onKeyDown={handleKeyDown}
            inputReadOnly={false}
            ref={(node) => {
              if (node && node.input) {
                inputRef.current = node.input;
              }
            }}
          />
        </Form.Item>
      );
    } else {
      inputNode = (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[{ required: true, message: `Please Input ${title}!` }]}
        >
          <Input ref={inputRef} onKeyDown={handleKeyDown} />
        </Form.Item>
      );
    }
  }

  return <td {...restProps}>{editing ? inputNode : children}</td>;
};


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

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://192.168.0.140:4001/api/customer");
      setCustomers(response.data);
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
        "http://192.168.0.140:4001/api/customer",
        customer
      );
      setCustomers([...customers, response.data]);
      notification.success({ message: "Customer added successfully!" });
      setCustomer({ name: "", contact: "", email: "", date: "", location: "" });
    } catch (error) {
      notification.error({ message: "Failed to add customer" });
    } finally {
      setSubmitting(false);
    }
  };

  const save = async () => {
    try {
      const row = await form.validateFields();
      const originalCustomer = customers.find((c) => c.id === editingId);
      const updatedCustomer = {
        ...originalCustomer,
        name: row.name || originalCustomer.name,
        contact: row.contact || originalCustomer.contact,
        email: row.email || originalCustomer.email,
        date: row.date ? row.date.format("YYYY-MM-DD") : originalCustomer.date,
        location: row.location || originalCustomer.location,
      };

      const response = await axios.put(
        `http://192.168.0.140:4001/api/customer/${editingId}`,
        updatedCustomer
      );

      setCustomers(
        customers.map((item) => (item.id === editingId ? response.data : item))
      );
      setEditingId("");
      notification.success({ message: "Customer updated successfully!" });
    } catch (errInfo) {
      console.error("Failed to save customer:", errInfo);
      notification.error({ message: "Failed to update customer" });
    }
  };

  const cancel = () => {
    setEditingId("");
    form.resetFields();
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://192.168.0.140:4001/api/customer/${id}`);
      setCustomers(customers.filter((c) => c.id !== id));
      notification.success({ message: "Customer deleted successfully!" });
    } catch (err) {
      notification.error({ message: "Failed to delete customer" });
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

  const handleDateChange = (date, dateString) => {
    setCustomer({ ...customer, date: dateString });
  };

  useEffect(() => {
    fetchCustomers();
    const pieUrl = getPowerBIUrl("customers", "line");
    setPowerBiUrlState(pieUrl);
  }, []);

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

  // use same handleKeyDown function as EditableCell
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      save();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  };

  return editable ? (
    <Form.Item
      name="location"
      style={{ margin: 0 }}
      rules={[{ required: true, message: "Please Input Location!" }]}
    >
      <Input onKeyDown={handleKeyDown} />
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
                  value={customer.date ? dayjs(customer.date) : null}
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
              <SaveContext.Provider value={save}>
                <CancelContext.Provider value={cancel}>
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
                </CancelContext.Provider>
              </SaveContext.Provider>
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

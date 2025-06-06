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
   UserAddOutlined,
   TableOutlined ,
   LineChartOutlined
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
    { title: "Customer ID", dataIndex: "id", key: "id",sorter: (a, b) => a.id - b.id },
    { title: "Contact", dataIndex: "contact", key: "contact", editable: true },
    { title: "Email", dataIndex: "email", key: "email", editable: true },
    { title: "Date", dataIndex: "date", key: "date",sorter: (a, b) => new Date(a.date) - new Date(b.date), editable: true },
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
      <Row gutter={[16, 16]} justify="center">
  <Col xs={24} md={24} lg={24}>
   <Card
  title={
    <span>
      <UserAddOutlined style={{ marginRight: 8 }} />
      Add Customer
    </span>
  }
  style={{ marginBottom: "20px", background: "#f8f9fa" }}
>
      <Form
        layout="vertical"
        onSubmitCapture={handleSubmit}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item label="Name:">
              <Input value={customer.name} placeholder="Name" onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item label="Contact:">
              <Input value={customer.contact} placeholder="Contact" onChange={(e) => setCustomer({ ...customer, contact: e.target.value })} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item label="Email:">
              <Input value={customer.email} placeholder="Email"onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item label="Date:">
              <DatePicker
                format="YYYY-MM-DD"
                value={customer.date ? dayjs(customer.date) : null}
                onChange={handleDateChange}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item label="Location:">
              <Input value={customer.location} placeholder="Location" onChange={(e) => setCustomer({ ...customer, location: e.target.value })} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item style={{ marginTop: 30 }}>
              <Button type="primary" htmlType="submit" loading={submitting} block>
                {submitting ? "Adding..." : "Add Customer"}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  </Col>

  <Col xs={24}>
    <Card
  title={
    <span>
      <TableOutlined style={{ marginRight: 8 }} />
      Customer Data
    </span>
  }
  style={{ background: "#f8f9fa", marginBottom: 20 }}
>
      <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} />} tip="Loading Data...">
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
  </Col>

  <Col xs={24}>
    <Card title={
    <span>
      <LineChartOutlined style={{ marginRight: 8 }} />
      Customer Trends
    </span>} style={{ background: "#f8f9fa" }}>
      {powerBiUrl ? (
        <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", height: 0 }}>
          <iframe
            title="Power BI Customer Line Chart"
            src='https://app.powerbi.com/view?r=eyJrIjoiNDZmMjlmYzItZmY0Mi00ZDY3LWIwZjktNDAzMGU1Y2ZjMjdmIiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9'
            frameBorder="0"
            allowFullScreen
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "none"
            }}
          />
        </div>
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

import React, { useState, useEffect } from "react";
import { getPowerBIUrl } from "./powerBiUrls";
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
import { LoadingOutlined, EditOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

// Keep everything at top as-is

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
        dataIndex === "dueMonth" ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[{ required: true, message: `Please input ${title}!` }]}
          >
            <DatePicker
              format="YYYY-MM-DD"
              
              style={{ width: '100%' }}
            />
          </Form.Item>
        ) : (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[{ required: true, message: `Please input ${title}!` }]}
          >
            <Input  />
          </Form.Item>
        )
      ) : (
        children
      )}
    </td>
  );
};

const Invoice = () => {
  const [form] = Form.useForm();
const [editingId, setEditingId] = useState("");
const [invoices, setInvoices] = useState([]);
const [invoice, setInvoice] = useState({ amount: "" });
const [customerId, setCustomerId] = useState("");
const [dueDate, setDueDate] = useState(null);
const [loading, setLoading] = useState(true);
const [submitting, setSubmitting] = useState(false);
const [powerBiUrl, setPowerBiUrl] = useState("");

// Fetch invoice data from backend
useEffect(() => {
  const fetchInvoices = async () => {
    try {
      const response = await axios.get("http://192.168.0.106:8080/api/invoice");
      setInvoices(response.data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchInvoices();
}, []);

// Handle Date Change
const handleDateChange = (date) => {
  setDueDate(date);
};

// Handle Add Invoice
const handleSubmit = async () => {
  if (!customerId || !invoice.amount || !dueDate) {
    notification.error({ message: "Please fill all fields!" });
    return;
  }

  const newInvoice = {
    customerId: customerId,
    amount: invoice.amount,
    dueMonth: dueDate.format("YYYY-MM-DD"),
  };

  try {
    setSubmitting(true);
    const response = await axios.post(
      "http://192.168.0.106:8080/api/invoice",
      newInvoice
    );
    setInvoices([...invoices, response.data]);
    setInvoice({ amount: "" });
    setCustomerId("");
    setDueDate(null);
    notification.success({ message: "Invoice added successfully!" });
  } catch (error) {
    console.error("Error adding invoice:", error);
    notification.error({ message: "Failed to add invoice." });
  } finally {
    setSubmitting(false);
  }
};


  const isEditing = (record) => record.id === editingId;

  const edit = (record) => {
    form.setFieldsValue({
      amount: record.amount,
      dueMonth: record.dueMonth ? dayjs(record.dueMonth) : null,
    });
    setEditingId(record.id);
  };

  const save = async () => {
    try {
      const row = await form.validateFields();

      const updatedInvoice = {
        ...row,
        id: editingId,
        dueMonth: row.dueMonth ? row.dueMonth.format("YYYY-MM-DD") : "",
      };

      await axios.put(
        `http://192.168.0.106:8080/api/invoice/${editingId}`,
        updatedInvoice
      );

      const newData = invoices.map((item) =>
        item.id === editingId ? { ...item, ...updatedInvoice } : item
      );

      setInvoices(newData);
      setEditingId("");
      notification.success({ message: "Invoice updated successfully!" });
    } catch (error) {
      console.error("Error updating invoice:", error);
    }
  };

  const columns = [
    {
      title: "Invoice ID",
      dataIndex: "invoiceId",
      key: "invoiceId",
    },
    {
      title: "Customer ID",
      dataIndex: ["customer", "id"],
      key: "customerId",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      editable: true,
    },
    {
      title: "Due Month",
      dataIndex: "dueMonth",
      key: "dueMonth",
      editable: true,
    },
    {
      title: "",
      key: "edit",
      width: 50,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? null : (
          <EditOutlined
            style={{ color: "#1890ff", cursor: "pointer" }}
            onClick={() => edit(record)}
          />
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
        inputType: col.dataIndex === "dueMonth" ? "date" : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <div style={{ padding: "20px" }}>
      {/* Add Invoice Form - unchanged */}
      <Row gutter={16}>
        <Col span={24}>
          <Card title="Add Invoice" style={{ marginBottom: 20 }}>
            <Form
              layout="inline"
              onSubmitCapture={handleSubmit}
              style={{ display: "flex", gap: 8, flexWrap: "nowrap", alignItems: "center" }}
            >
              <Form.Item label="Customer ID:" style={{ marginBottom: 0 }}>
                <Input
                  style={{ width: 120 }}
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                />
              </Form.Item>

              <Form.Item label="Amount:" style={{ marginBottom: 0 }}>
                <Input
                  style={{ width: 130 }}
                  value={invoice.amount}
                  onChange={(e) =>
                    setInvoice({ ...invoice, amount: e.target.value })
                  }
                />
              </Form.Item>

              <Form.Item label="Due Month:" style={{ marginBottom: 0 }}>
                <DatePicker
                  style={{ width: 130 }}
                  format="YYYY-MM-DD"
                  onChange={handleDateChange}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  {submitting ? "Adding..." : "Add Invoice"}
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* Table Section */}
          <Card title="Invoice Data" style={{ marginBottom: 20 }}>
            <Spin
              spinning={loading}
              tip="Loading Data..."
              indicator={<LoadingOutlined style={{ fontSize: 24 }} />}
            >
              <Form form={form} component={false} onFinish={save}>
                <Table
                  components={{
                    body: {
                      cell: EditableCell,
                    },
                  }}
                  dataSource={invoices}
                  columns={mergedColumns}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  onRow={(record) => ({
                    onDoubleClick: () => edit(record),
                  })}
                />
              </Form>
            </Spin>
          </Card>

          {/* Power BI Report */}
          <Card title="Invoice Report">
            {powerBiUrl ? (
              <iframe
                title="Power BI Invoice Line Chart"
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

export default Invoice;

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
  Space
} from "antd";
import { LoadingOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

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
            <Input onPressEnter={save} />
          </Form.Item>
        )
      ) : (
        children
      )}
    </td>
  );
};

let save; // Global save function for cell access

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

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get("http://192.168.0.106:4001/api/invoice");
        setInvoices(response.data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const handleDateChange = (date) => {
    setDueDate(date);
  };

  const handleSubmit = async () => {
    if (!customerId || !invoice.amount || !dueDate) {
      notification.error({ message: "Please fill all fields!" });
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(
        "http://192.168.0.106:4001/api/invoice",
        {
          customerId: customerId,
          amount: invoice.amount,
          dueMonth: dueDate.format("YYYY-MM-DD"),
        }
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

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://192.168.0.106:4001/api/invoice/${id}`);
      setInvoices(invoices.filter(invoice => invoice.id !== id));
      notification.success({ message: "Invoice deleted successfully!" });
    } catch (error) {
      notification.error({ message: "Failed to delete invoice" });
    }
  };

  save = async () => {
    try {
      const row = await form.validateFields();
      const updatedInvoice = {
        ...row,
        id: editingId,
        dueMonth: row.dueMonth.format("YYYY-MM-DD"),
      };

      await axios.put(
        `http://192.168.0.106:4001/api/invoice/${editingId}`,
        updatedInvoice
      );

      setInvoices(invoices.map(item => 
        item.id === editingId ? { ...item, ...updatedInvoice } : item
      ));
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
      key: "actions",
      width: 100,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? null : (
          <Space size="middle">
            <EditOutlined 
              onClick={() => edit(record)}
              style={{ color: "#1890ff", cursor: "pointer" }}
            />
            <DeleteOutlined
              onClick={() => handleDelete(record.id)}
              style={{ color: "#ff4d4f", cursor: "pointer" }}
            />
          </Space>
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
      <Row gutter={16}>
        <Col span={24}>
          <Card title="Add Invoice" style={{ marginBottom: 20 }}>
            {/* ... (keep your existing add form JSX) ... */}
          </Card>

          <Card title="Invoice Data" style={{ marginBottom: 20 }}>
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
              <Form form={form} component={false}>
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

          <Card title="Invoice Report">
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

export default Invoice;
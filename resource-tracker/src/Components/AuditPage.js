import React, { useEffect, useState } from 'react';
import {
  Table,
  Select,
  Input,
  DatePicker,
  Row,
  Col,
  Button,
  Card,
  Spin,
  notification
} from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import { LoadingOutlined } from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;

const LogAuditTrail = () => {
  const [auditData, setAuditData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://192.168.0.140:4001/api/audit');
      
      const deduplicatedData = res.data.reduce((acc, current) => {
        if (current.endpoint === '/api/audit' && current.method === 'GET' || 
            current.endpoint === '/api/customer' && current.method === 'GET') {
          return acc;
        }
        
        const existingIndex = acc.findIndex(item => 
          Math.abs(dayjs(item.timestamp).diff(current.timestamp, 'second')) < 2 &&
          item.entityName === current.entityName &&
          item.method === current.method
        );
        
        if (existingIndex === -1) {
          return [...acc, current];
        }
        
        if (current.method === 'PUT' && current.action.length > acc[existingIndex].action.length) {
          const newAcc = [...acc];
          newAcc[existingIndex] = current;
          return newAcc;
        }
        
        return acc;
      }, []);
      
      setAuditData(deduplicatedData);
    } catch (error) {
      console.error('Failed to fetch audit data', error);
      notification.error({ message: 'Failed to load audit logs' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  const formatData = (data) => {
    if (!data) return 'NULL';
    
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      
      return (
        <pre style={{ 
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          maxWidth: '300px'
        }}>
          {Object.entries(parsed).map(([key, value]) => (
            <div key={key}>
              <strong>{key}:</strong> {String(value)}
            </div>
          ))}
        </pre>
      );
    } catch (e) {
      return <pre style={{ margin: 0 }}>{String(data)}</pre>;
    }
  };

  const filteredAuditData = auditData.filter(item => {
    const matchesEntity = filter === 'All' || item.entityName === filter;
    const matchesSearch = searchText === '' || 
      item.action.toLowerCase().includes(searchText.toLowerCase()) ||
      item.ipAddress.includes(searchText) ||
      item.method.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesDate = dateRange.length === 0 || (
      dayjs(item.timestamp).isAfter(dateRange[0]) &&
      dayjs(item.timestamp).isBefore(dateRange[1].endOf('day'))
    );

    return matchesEntity && matchesSearch && matchesDate;
  });

  const exportToCSV = () => {
    const headers = 'ID,IP Address,Action,Endpoint,Method,Entity,Timestamp,Old Data,New Data';
    const rows = filteredAuditData.map(item => [
      item.id,
      `"${item.ipAddress}"`,
      `"${item.action}"`,
      `"${item.endpoint}"`,
      `"${item.method}"`,
      `"${item.entityName}"`,
      `"${item.timestamp}"`,
      `"${JSON.stringify(item.oldData)}"`,
      `"${JSON.stringify(item.newData)}"`,
    ].join(','));
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `audit_logs_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.csv`);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 120,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (text) => <span>{text.length > 30 ? `${text.substring(0, 30)}...` : text}</span>,
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      width: 100,
    },
    {
      title: 'Entity',
      dataIndex: 'entityName',
      key: 'entityName',
      width: 120,
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    },
    {
      title: 'Old Data',
      dataIndex: 'oldData',
      key: 'oldData',
      render: formatData,
    },
    {
      title: 'New Data',
      dataIndex: 'newData',
      key: 'newData',
      render: formatData,
    },
  ];

  return (
    <Card title="Audit Trail Logs" style={{ margin: 16 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Select
            value={filter}
            onChange={setFilter}
            style={{ width: '100%' }}
          >
            <Option value="All">All Entities</Option>
            <Option value="Customer">Customer</Option>
            <Option value="User">User</Option>
            <Option value="Product">Product</Option>
          </Select>
        </Col>
        <Col span={10}>
          <Search
            placeholder="Search action, IP, or method"
            allowClear
            enterButton
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Col>
        <Col span={6}>
          <RangePicker
            style={{ width: '100%' }}
            onChange={setDateRange}
            showTime={{ format: 'HH:mm' }}
            format="YYYY-MM-DD HH:mm"
          />
        </Col>
        <Col span={2}>
          <Button type="primary" onClick={exportToCSV}>
            Export CSV
          </Button>
        </Col>
      </Row>
      <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
        <Table
          columns={columns}
          dataSource={filteredAuditData}
          rowKey="id"
          scroll={{ x: 1500 }}
          pagination={{
            ...pagination,
            total: filteredAuditData.length,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={(pagination) => setPagination(pagination)}
        />
      </Spin>
    </Card>
  );
};

export default LogAuditTrail;
import React, { useState, useEffect } from 'react';
import { Button, Table } from 'antd';
import axios from 'axios';

const LogAuditTrail = () => {
  const [auditData, setAuditData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('customer');

  const logAuditTrail = async ({ action, endpoint, method, entityName }) => {
    try {
      await axios.post('/api/audit', {
        action,
        endpoint,
        method,
        entityName,
      });
    } catch (error) {
      console.error("Failed to log audit trail:", error);
    }
  };

  useEffect(() => {
    const fetchAudit = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://192.168.0.140:8080/api/audit');
        setAuditData(res.data);

        await logAuditTrail({
          action: `Viewed Audit Logs for ${filter}`,
          endpoint: '/api/audit',
          method: 'READ',
          entityName: filter,
        });
      } catch (error) {
        console.error('Failed to fetch audit data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAudit();
  }, [filter]);

  const filteredAuditData = auditData.filter((item) => item.entityType === filter);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Entity Type', dataIndex: 'entityType', key: 'entityType' },
    { title: 'Changed By', dataIndex: 'changedBy', key: 'changedBy' },
    { title: 'Change Date', dataIndex: 'changeDate', key: 'changeDate' },
    { title: 'Changes', dataIndex: 'changes', key: 'changes' },
  ];

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <Button
          type={filter === 'customer' ? 'primary' : 'default'}
          onClick={() => setFilter('customer')}
        >
          Customer
        </Button>
        <Button
          type={filter === 'order' ? 'primary' : 'default'}
          onClick={() => setFilter('order')}
          style={{ marginLeft: 8 }}
        >
          Order
        </Button>
        <Button
          type={filter === 'invoice' ? 'primary' : 'default'}
          onClick={() => setFilter('invoice')}
          style={{ marginLeft: 8 }}
        >
          Invoice
        </Button>
      </div>

      <Table columns={columns} dataSource={filteredAuditData} loading={loading} rowKey="id" />
    </div>
  );
};

export default LogAuditTrail;

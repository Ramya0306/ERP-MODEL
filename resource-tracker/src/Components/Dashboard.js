import React, { useState } from 'react';
import { Row, Col, Card, Select, Button, Typography } from 'antd';
import { getPowerBIUrl } from './powerBiUrls';

const { Option } = Select;
const { Title, Paragraph } = Typography;


const Dashboard = () => {
  const [chartType, setChartType] = useState();
  const [dataType, setDataType] = useState();
  const [selectedUrl, setSelectedUrl] = useState(null);

  const handleGenerateReport = () => {
    if (dataType && chartType) {
      const url = getPowerBIUrl(dataType, chartType);
      setSelectedUrl(url);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title="Resource Tracker Dashboard">
        
        <Title level={2}>Performance Overview</Title>
        <Paragraph>Select options below to generate a Power BI report.</Paragraph>
      </Card>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={8}>
          <Card title="Select Data Type">
            <Select value={dataType} onChange={setDataType} style={{ width: '100%' }}>
              <Option value="customers">Customers</Option>
              <Option value="orders">Orders</Option>
              <Option value="invoices">Invoices</Option>
            </Select>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Select Chart Type">
            <Select value={chartType} onChange={setChartType} style={{ width: '100%' }}>
              <Option value="pie">Pie Chart</Option>
              <Option value="line">Line Graph</Option>
              <Option value="bar">Bar Graph</Option>
              <Option value=""></Option>
            </Select>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Generate Report">
            <Button
              type="primary"
              onClick={handleGenerateReport}
              disabled={!dataType || !chartType}
              style={{ width: '100%' }}
            >
              Generate Power BI Report
            </Button>
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Dashboard Visualization">
            {selectedUrl ? (
              <iframe
                title="Power BI Report"
                width="100%"
                height="600px"
                src={selectedUrl}
                frameBorder="0"
                allowFullScreen={true}
              />
            ) : (
              <p style={{ textAlign: 'center' }}>
                Select options and click "Generate Power BI Report"
              </p>
            )}
          </Card>
          
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;




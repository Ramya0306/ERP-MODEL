import React, { useState } from 'react';
import { Row, Col, Card, Select, Button, Typography, Grid } from 'antd';
import { getPowerBIUrl } from './powerBiUrls';
import MetricCards from './Card';
import {
  PieChartOutlined,
  LineChartOutlined,
  BarChartOutlined,
  AreaChartOutlined,
  FunnelPlotOutlined,
  DotChartOutlined,
  FallOutlined,
    UserOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
const { Option } = Select;
const { Title, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const Dashboard = () => {
  const [chartType, setChartType] = useState();
  const [dataType, setDataType] = useState();
  const [selectedUrl, setSelectedUrl] = useState(null);
  const screens = useBreakpoint();

  const handleGenerateReport = () => {
    if (dataType && chartType) {
      const url = getPowerBIUrl(dataType, chartType);
      setSelectedUrl(url);
    }
  };

  // Responsive column span values
  const colSpan = screens.xs ? 24 : 8;

  return (
    <div style={{ padding: 0 }}>
      <Card 
        title={
          <span style={{ 
            fontSize: '24px',
            fontWeight: 600,
            color: '#1a3353'
          }}>
            Resource Tracker Dashboard
          </span>
        }
        style={{
          background: "#f8f9fa",
          border: 'none',
        }}
        headStyle={{
          borderBottom: '1px solid #e8e8e8',
          padding: '16px 24px',
          background: '#f8f9fa'
        }}
      >
        <MetricCards />
      </Card>

      
      <Row gutter={[16, 24]} style={{ marginTop: 24 }}>
      <Col span={colSpan}>
  <Card title="Select Data Type" style={{ background: "#f8f9fa" }}>
    <Select value={dataType} onChange={setDataType} style={{ width: '100%' }}>
      <Option value="customers">
        <UserOutlined style={{ marginRight: 8 }} />
        Customers
      </Option>
      <Option value="orders">
        <ShoppingCartOutlined style={{ marginRight: 8 }} />
        Orders
      </Option>
      <Option value="invoices">
        <FileTextOutlined style={{ marginRight: 8 }} />
        Invoices
      </Option>
    </Select>
  </Card>
</Col>

        <Col span={colSpan}>
  <Card title="Select Chart Type" style={{ background: "#f8f9fa" }}>
    <Select value={chartType} onChange={setChartType} style={{ width: '100%' }}>
      <Option value="pie">
        <PieChartOutlined style={{ marginRight: 8 }} />
        Pie Chart
      </Option>
      <Option value="line">
        <LineChartOutlined style={{ marginRight: 8 }} />
        Line Graph
      </Option>
      <Option value="bar">
        <BarChartOutlined style={{ marginRight: 8 }} />
        Bar Graph
      </Option>
      <Option value="area">
        <AreaChartOutlined style={{ marginRight: 8 }} />
        Area Chart
      </Option>
      <Option value="funnel">
        <FunnelPlotOutlined style={{ marginRight: 8 }} />
        Funnel Chart
      </Option>
      <Option value="donut">
        <DotChartOutlined style={{ marginRight: 8 }} />
        Donut Chart
      </Option>
      <Option value="water">
        <FallOutlined style={{ marginRight: 8 }} />
        Waterfall Chart
      </Option>
    </Select>
  </Card>
</Col>

        <Col span={colSpan}>
          <Card title="Generate Report" style={{ background: "#f8f9fa" }}>
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

      <Row style={{ marginTop: 24}}>
        <Col span={24}>
          <Card title="Dashboard Visualization" style={{ background: "#f8f9fa" }}>
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
            <Row style={{ marginTop: 24}}>
        <Col span={24}>
            <Card title="Our Customers"  style={{ background: "#f8f9fa" }}>
            <iframe 
              title="TRACKER - MAP"
              width="100%" 
              height="700" 
              src="https://app.powerbi.com/view?r=eyJrIjoiNjVmNzQ0OTctZTI5Ni00MDk4LThlMTItMmNkZTI0YWUyNWZiIiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9" 
              frameBorder="0" 
              allowFullScreen
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

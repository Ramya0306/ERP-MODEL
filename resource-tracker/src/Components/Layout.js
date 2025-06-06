import React, { useState } from "react";
import { Layout, Menu, theme, Avatar, Dropdown, Space, Typography } from "antd";
import { Tooltip, Badge } from 'antd';
import {
  HomeOutlined,
  UserAddOutlined,
  ShoppingCartOutlined,
  FileDoneOutlined,
  FileSearchOutlined,
  RocketOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  QuestionCircleOutlined
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

const AppLayout = ({ children }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, colorPrimary },
  } = theme.useToken();

  // Map routes to page titles
  const pageTitles = {
    '/': 'Dashboard',
    '/customer': 'Customer Management',
    '/order': 'Order Management',
    '/invoice': 'Invoice Management',
    '/logAuditTrail': 'Audit Logs'
  };

  // Get current page title or fallback to 'Dashboard'
  const currentPageTitle = pageTitles[location.pathname] || 'Dashboard';

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{
          background: colorBgContainer,
          boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
          position: "fixed",
          height: "100vh",
          zIndex: 100,
        }}
        width={240}
        collapsedWidth={80}
        trigger={null}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: `1px solid rgba(0, 0, 0, 0.06)`,
          }}
        >
          {collapsed ? (
            <RocketOutlined style={{ fontSize: 24, color: colorPrimary }} />
          ) : (
            <Space>
              <RocketOutlined style={{ fontSize: 24, color: colorPrimary }} />
              <Text strong style={{ fontSize: 18 }}>ERP PLATFORM</Text>
            </Space>
          )}
        </div>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ padding: "16px 0", borderRight: 0 }}
        >
          <Menu.Item key="/" icon={<HomeOutlined style={{ fontSize: 18 }} />}>
            <Link to="/">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="/customer" icon={<UserAddOutlined style={{ fontSize: 18 }} />}>
            <Link to="/customer">Customers</Link>
          </Menu.Item>
          <Menu.Item key="/order" icon={<ShoppingCartOutlined style={{ fontSize: 18 }} />}>
            <Link to="/order">Orders</Link>
          </Menu.Item>
          <Menu.Item key="/invoice" icon={<FileDoneOutlined style={{ fontSize: 18 }} />}>
            <Link to="/invoice">Invoices</Link>
          </Menu.Item>
          <Menu.Item key="/logAuditTrail" icon={<FileSearchOutlined style={{ fontSize: 18 }} />}>
            <Link to="/logAuditTrail">Audit Logs</Link>
          </Menu.Item>
        </Menu>
      </Sider>

      {/* Main Layout */}
      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: "all 0.2s" }}>
        {/* Top Header */}
        <Header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            width: "100%",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: colorBgContainer,
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        >
          <Space>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: () => setCollapsed(!collapsed),
              style: { fontSize: 20 }
            })}
            <Text strong style={{ fontSize: 16 }}>{currentPageTitle}</Text>
          </Space>

          <Space size="large">
  <Tooltip title="Notifications" placement="bottom">
    <Badge count={0} size="small">
      <BellOutlined 
        style={{ 
          fontSize: 18, 
          cursor: "pointer",
          color: 'rgba(0, 0, 0, 0.65)',
          transition: 'color 0.3s',
        }} 
        onMouseEnter={(e) => e.currentTarget.style.color = colorPrimary}
        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.65)'}
      />
    </Badge>
  </Tooltip>
  
  <Tooltip title="Help" placement="bottom">
    <QuestionCircleOutlined 
      style={{ 
        fontSize: 18, 
        cursor: "pointer",
        color: 'rgba(0, 0, 0, 0.65)',
        transition: 'color 0.3s',
      }} 
      onMouseEnter={(e) => e.currentTarget.style.color = colorPrimary}
      onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.65)'}
    />
  </Tooltip>
  
  <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
    <Space style={{ cursor: "pointer" }}>
      <Avatar icon={<UserOutlined />} />
      {!collapsed && <Text>Admin User</Text>}
    </Space>
  </Dropdown>
</Space>
        </Header>

        {/* Content Area */}
        <Content
          style={{
            margin: " 0",
            overflow: "initial",
            minHeight: "0",
          }}
        >
          <div
            style={{
              padding: 24,
              background: "#f8f9fa", // Light grey background
              background: colorBgContainer,
              borderRadius: 8,
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            {children}
          </div>
        </Content>

        {/* Footer */}
        <Footer
          style={{
            textAlign: "center",
            padding: "16px 24px",
            fontSize: 14,
            background: colorBgContainer,
            borderTop: "1px solid rgba(0, 0, 0, 0.06)",
          }}
        >
          © {new Date().getFullYear()} Tracker ERP v1.0.0 · All rights reserved
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
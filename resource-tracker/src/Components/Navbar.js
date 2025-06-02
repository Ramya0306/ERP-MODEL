
import React from 'react';
import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';
import {
  HomeOutlined,
  UserAddOutlined,
  ShoppingCartOutlined,
  FileDoneOutlined,  
  FileSearchOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const Navbar = () => {
  return (
    <Sider width={200} className="site-layout-background" style={{ height: '100vh' }}>
      <div className="logo" style={{ color: 'white', padding: '16px', fontSize: '30px', textAlign: 'center' }}>
        <strong>Tracker</strong>
      </div>
      <Menu
        mode="inline"
        defaultSelectedKeys={['1']}
        style={{ height: '100%', borderRight: 0 }}
      >
        <Menu.Item key="1" icon={<HomeOutlined />}>
          <Link to="/">Dashboard</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<UserAddOutlined />}>
          <Link to="/customer">Customers</Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<ShoppingCartOutlined />}>
          <Link to="/order">Orders</Link>
        </Menu.Item>
        <Menu.Item key="4" icon={<FileDoneOutlined />}>
          <Link to="/invoice">Invoices</Link>
        </Menu.Item>
        <Menu.Item key="5" icon={<FileSearchOutlined />}>
          <Link to="/logAuditTrail">Audit Logs</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Navbar;

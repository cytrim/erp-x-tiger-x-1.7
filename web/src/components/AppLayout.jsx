/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Typography } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { 
  UserOutlined, 
  SettingOutlined,
  LogoutOutlined,
  DashboardOutlined,
  TeamOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SecurityScanOutlined  // ✅ Fehlender Import hinzugefügt
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function AppLayout({ children }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const user = useSelector((state) => state.auth.user);
  const [collapsed, setCollapsed] = React.useState(false);

  const key = (() => {
    if (pathname.startsWith('/customers')) return 'customers';
    if (pathname.startsWith('/products')) return 'products';
    if (pathname.startsWith('/quotes')) return 'quotes';
    if (pathname.startsWith('/payments')) return 'payments';
    if (pathname.startsWith('/invoices')) return 'invoices';
    if (pathname.startsWith('/profile')) return 'profile';
    if (pathname.startsWith('/settings')) return 'settings';
    if (pathname.startsWith('/admin')) return 'admin';  // ✅ Admin-Route hinzugefügt
    return 'dashboard';
  })();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // User Dropdown Menu
  const userMenuItems = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '8px 0', borderBottom: '1px solid #303030' }}>
          <Text strong style={{ display: 'block' }}>{user?.name || 'User'}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{user?.email}</Text>
        </div>
      ),
      disabled: true
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('menu.profile', 'Mein Profil'),
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('menu.settings', 'Einstellungen'),
      onClick: () => navigate('/settings')
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('menu.logout', 'Abmelden'),
      danger: true,
      onClick: handleLogout
    }
  ];

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  // Main Navigation Menu - ✅ Vor adminMenuItems definiert
  const mainMenuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/">{t('nav.dashboard', 'Dashboard')}</Link>
    },
    {
      key: 'customers',
      icon: <TeamOutlined />,
      label: <Link to="/customers">{t('nav.customers', 'Kunden')}</Link>
    },
    {
      key: 'products',
      icon: <ShoppingOutlined />,
      label: <Link to="/products">{t('nav.products', 'Produkte')}</Link>
    },
    {
      key: 'quotes',
      icon: <FileTextOutlined />,
      label: <Link to="/quotes">{t('nav.quotes', 'Angebote')}</Link>
    },
    {
      key: 'invoices',
      icon: <FileTextOutlined />,
      label: <Link to="/invoices">{t('nav.invoices', 'Rechnungen')}</Link>
    },
    {
      key: 'payments',
      icon: <CreditCardOutlined />,
      label: <Link to="/payments">{t('nav.payments', 'Zahlungen')}</Link>
    }
  ];

  // Admin Menu Items - ✅ Nach mainMenuItems definiert
  const adminMenuItems = isAdmin ? [
    {
      key: 'admin',
      icon: <SecurityScanOutlined />,
      label: t('nav.admin', 'Admin'),
      children: [
        {
          key: 'admin-dashboard',
          label: <Link to="/admin">{t('nav.admin.dashboard', 'Admin Dashboard')}</Link>
        },
        {
          key: 'admin-users',
          label: <Link to="/admin/users">{t('nav.admin.users', 'Benutzerverwaltung')}</Link>
        },
        {
          key: 'admin-roles',
          label: <Link to="/admin/roles">{t('nav.admin.roles', 'Rollen & Berechtigungen')}</Link>
        },
        {
          key: 'admin-audit',
          label: <Link to="/admin/audit">{t('nav.admin.audit', 'Audit Log')}</Link>
        },
        {
          key: 'admin-settings',
          label: <Link to="/admin/settings">{t('nav.admin.settings', 'System-Einstellungen')}</Link>
        }
      ]
    }
  ] : [];

  // ✅ Jetzt korrekt nach beiden Definitionen
  const allMenuItems = [...mainMenuItems, ...adminMenuItems];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{ 
          overflow: 'auto',
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0
        }}
      >
        <div style={{ 
          padding: collapsed ? '16px 8px' : '16px',
          textAlign: 'center',
          borderBottom: '1px solid #303030'
        }}>
          <div className="brand">
            {collapsed ? 'TX' : (
              <>Tiger X <span className="brand-accent">Panel</span></>
            )}
          </div>
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[key]}
          items={allMenuItems}  // ✅ Verwendet jetzt allMenuItems
          style={{ borderRight: 0 }}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          padding: '0 24px',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: '#141414',
          borderBottom: '1px solid #303030',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <Space>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: () => setCollapsed(!collapsed),
              style: { fontSize: '18px', cursor: 'pointer', color: '#fff' }
            })}
          </Space>

          <Dropdown 
            menu={{ items: userMenuItems }} 
            placement="bottomRight"
            trigger={['click']}
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar 
                size="default" 
                icon={<UserOutlined />}
                style={{ 
                  backgroundColor: '#ff6b35',
                  cursor: 'pointer'
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Text style={{ color: '#fff', display: { xs: 'none', sm: 'inline' } }}>
                {user?.name || 'User'}
              </Text>
            </Space>
          </Dropdown>
        </Header>

        <Content style={{ 
          margin: '24px',
          minHeight: 280,
          background: '#0f0f0f'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
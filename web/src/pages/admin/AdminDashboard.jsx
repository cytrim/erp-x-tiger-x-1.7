/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission. */

import React, { useEffect, useState } from 'react';
import {
  Card, Row, Col, Statistic, Table, Tag, Timeline, Space, Spin,
  Alert, Button, Typography, List, Progress, Badge, Avatar, Tooltip
} from 'antd';
import {
  UserOutlined, TeamOutlined, LoginOutlined, SecurityScanOutlined,
  CloudServerOutlined, DatabaseOutlined, WarningOutlined, CheckCircleOutlined,
  SyncOutlined, ExportOutlined, SettingOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Line, Pie } from '@ant-design/charts';
import adminService from '../../services/admin.service';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  
  const loadDashboard = async () => {
    setLoading(true);
    try {
      const dashboardData = await adminService.getDashboardStats();
      setData(dashboardData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);
  
  const getActivityIcon = (action) => {
    const icons = {
      login: <LoginOutlined style={{ color: '#52c41a' }} />,
      logout: <LoginOutlined style={{ color: '#8c8c8c' }} />,
      failed_login: <WarningOutlined style={{ color: '#f5222d' }} />,
      create: <CheckCircleOutlined style={{ color: '#1890ff' }} />,
      update: <SyncOutlined style={{ color: '#faad14' }} />,
      delete: <WarningOutlined style={{ color: '#f5222d' }} />,
      permission_change: <SecurityScanOutlined style={{ color: '#722ed1' }} />
    };
    return icons[action] || <CheckCircleOutlined />;
  };
  
  const roleColors = {
    super_admin: '#f5222d',
    admin: '#ff6b35',
    manager: '#1890ff',
    staff: '#52c41a',
    viewer: '#8c8c8c',
    accountant: '#faad14'
  };
  
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Loading admin dashboard..." />
      </div>
    );
  }
  
  const pieData = (data.roleDistribution || []).map(item => ({
    type: item._id,
    value: item.count
  }));
  
  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <SecurityScanOutlined /> Admin Dashboard
          </Title>
          <Text type="secondary">System overview and management</Text>
        </Col>
        <Col>
          <Space>
            <Link to="/admin/users">
              <Button icon={<TeamOutlined />}>Manage Users</Button>
            </Link>
            <Link to="/admin/settings">
              <Button icon={<SettingOutlined />}>System Settings</Button>
            </Link>
            <Button icon={<ExportOutlined />} onClick={() => adminService.exportData('all')}>
              Export Data
            </Button>
          </Space>
        </Col>
      </Row>
      
      {/* User Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={data.users?.total || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress 
              percent={(data.users?.active / data.users?.total * 100) || 0} 
              size="small"
              format={() => `${data.users?.active} active`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Badge count={data.users?.online || 0} showZero color="#52c41a">
              <Statistic
                title="Online Now"
                value={data.users?.online || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Badge>
            <Text type="secondary">Last 15 minutes</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Logins Today"
              value={data.activity?.loginsToday || 0}
              prefix={<LoginOutlined />}
              suffix={
                data.activity?.failedLogins > 0 && (
                  <Tooltip title={`${data.activity.failedLogins} failed attempts`}>
                    <Badge count={data.activity.failedLogins} />
                  </Tooltip>
                )
              }
            />
            <Text type="secondary">New users: {data.users?.newToday || 0}</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="System Health"
              value="Healthy"
              valueStyle={{ color: '#52c41a' }}
              prefix={<DatabaseOutlined />}
            />
            <Text type="secondary">
              Uptime: {Math.floor((data.systemHealth?.uptime || 0) / 3600)}h
            </Text>
          </Card>
        </Col>
      </Row>
      
      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="User Roles Distribution">
            {pieData.length > 0 && (
              <Pie
                data={pieData}
                angleField="value"
                colorField="type"
                radius={0.8}
                label={{
                  type: 'outer',
                  content: '{name} {percentage}'
                }}
                interactions={[{ type: 'element-active' }]}
                color={({ type }) => roleColors[type] || '#8c8c8c'}
                height={300}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Recent Activity">
            <Timeline>
              {(data.activity?.recentActivities || []).slice(0, 8).map((activity, index) => (
                <Timeline.Item
                  key={index}
                  dot={getActivityIcon(activity.action)}
                >
                  <Space direction="vertical" size={0}>
                    <Space>
                      <Text strong>{activity.module}</Text>
                      <Tag color={activity.status === 'success' ? 'success' : 'error'}>
                        {activity.action}
                      </Tag>
                    </Space>
                    <Text type="secondary">
                      {activity.userName} • {dayjs(activity.createdAt).fromNow()}
                    </Text>
                  </Space>
                </Timeline.Item>
              ))}
            </Timeline>
            <Link to="/admin/audit">
              <Button type="link">View all activity →</Button>
            </Link>
          </Card>
        </Col>
      </Row>
      
      {/* System Status */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="System Status">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <CloudServerOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                  <Title level={4}>Server</Title>
                  <Tag color="success">Online</Tag>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">CPU: </Text>
                    <Progress percent={35} size="small" />
                    <Text type="secondary">Memory: </Text>
                    <Progress percent={Math.round((data.systemHealth?.memoryUsage?.heapUsed / data.systemHealth?.memoryUsage?.heapTotal * 100) || 0)} size="small" />
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <DatabaseOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                  <Title level={4}>Database</Title>
                  <Tag color="success">Healthy</Tag>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">Disk: {data.systemHealth?.diskSpace?.percentage || 0}% used</Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <SecurityScanOutlined style={{ fontSize: 48, color: '#faad14' }} />
                  <Title level={4}>Security</Title>
                  <Tag color="warning">{data.activity?.failedLogins || 0} failed logins</Tag>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">Last scan: Today</Text>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
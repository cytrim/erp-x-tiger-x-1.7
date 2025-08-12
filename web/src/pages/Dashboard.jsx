/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import React, { useEffect, useState } from 'react';
import { 
  Card, Row, Col, Statistic, Table, Tag, Timeline, Space, Spin, 
  Alert, Button, Select, Typography, List, Progress, Badge 
} from 'antd';
import {
  ShoppingCartOutlined,
  TeamOutlined,
  FileTextOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api from '../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function Dashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState({});
  const [period, setPeriod] = useState('month');

  // Farben für Charts
  const COLORS = ['#ff6b35', '#52c41a', '#1890ff', '#faad14', '#f5222d'];

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, activityRes, chartRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/activity'),
        api.get(`/dashboard/charts?period=${period}`)
      ]);

      setStats(statsRes.data);
      setActivities(activityRes.data.activities || []);
      setChartData(chartRes.data);
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [period]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(value || 0);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'invoice': return <FileTextOutlined style={{ color: '#1890ff' }} />;
      case 'payment': return <DollarOutlined style={{ color: '#52c41a' }} />;
      case 'customer': return <TeamOutlined style={{ color: '#ff6b35' }} />;
      default: return <ClockCircleOutlined />;
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      paid: { color: 'success', text: 'Bezahlt' },
      sent: { color: 'processing', text: 'Versendet' },
      draft: { color: 'default', text: 'Entwurf' },
      overdue: { color: 'error', text: 'Überfällig' },
      partial: { color: 'warning', text: 'Teilzahlung' },
      received: { color: 'success', text: 'Erhalten' },
      new: { color: 'blue', text: 'Neu' }
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Chart-Daten vorbereiten
  const revenueChartData = (chartData.revenue || []).map(item => ({
    name: period === 'year' ? `Monat ${item._id}` : `Tag ${item._id}`,
    Umsatz: item.revenue,
    Anzahl: item.count
  }));

  const pieChartData = (chartData.statusDistribution || []).map(item => ({
    name: item._id,
    value: item.count,
    total: item.total
  }));

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Dashboard wird geladen..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            Dashboard
          </Title>
          <Text type="secondary">
            Willkommen zurück! Hier ist deine Übersicht.
          </Text>
        </Col>
        <Col>
          <Space>
            <Select 
              value={period} 
              onChange={setPeriod}
              style={{ width: 120 }}
            >
              <Select.Option value="week">7 Tage</Select.Option>
              <Select.Option value="month">30 Tage</Select.Option>
              <Select.Option value="year">Jahr</Select.Option>
            </Select>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadDashboardData}
            >
              Aktualisieren
            </Button>
          </Space>
        </Col>
      </Row>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Monatsumsatz"
              value={stats.revenue?.month || 0}
              precision={2}
              prefix="€"
              valueStyle={{ color: '#52c41a' }}
              suffix={
                <span style={{ fontSize: 14, marginLeft: 8 }}>
                  <ArrowUpOutlined /> 12%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Jahresumsatz"
              value={stats.revenue?.year || 0}
              precision={2}
              prefix="€"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Badge count={stats.overdueInvoices?.count || 0} offset={[-10, 0]}>
              <Statistic
                title="Offene Rechnungen"
                value={stats.openInvoices?.total || 0}
                precision={2}
                prefix="€"
                valueStyle={{ color: '#faad14' }}
                suffix={
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    ({stats.openInvoices?.count || 0})
                  </Text>
                }
              />
            </Badge>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Kunden"
              value={stats.customers || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#ff6b35' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card 
            title="Umsatzentwicklung" 
            extra={
              <Link to="/invoices">
                <Button type="link">Alle Rechnungen →</Button>
              </Link>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="Umsatz" 
                  stroke="#ff6b35" 
                  strokeWidth={2}
                  dot={{ fill: '#ff6b35' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Rechnungsstatus">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Bottom Row */}
      <Row gutter={[16, 16]}>
        {/* Recent Activity */}
        <Col xs={24} lg={12}>
          <Card 
            title="Letzte Aktivitäten"
            bodyStyle={{ maxHeight: 400, overflowY: 'auto' }}
          >
            <Timeline>
              {activities.map((activity, index) => (
                <Timeline.Item 
                  key={index}
                  dot={getActivityIcon(activity.type)}
                >
                  <Space direction="vertical" size={0}>
                    <Space>
                      <Text strong>{activity.title}</Text>
                      {getStatusTag(activity.status)}
                    </Space>
                    <Text type="secondary">{activity.description}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(activity.date).format('DD.MM.YYYY HH:mm')}
                    </Text>
                  </Space>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>

        {/* Top Customers */}
        <Col xs={24} lg={12}>
          <Card 
            title="Top Kunden"
            extra={
              <Link to="/customers">
                <Button type="link">Alle Kunden →</Button>
              </Link>
            }
          >
            <List
              dataSource={chartData.topCustomers || []}
              renderItem={(customer, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: COLORS[index % COLORS.length],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 'bold'
                      }}>
                        {index + 1}
                      </div>
                    }
                    title={customer.name}
                    description={`${customer.count} Rechnungen`}
                  />
                  <div style={{ textAlign: 'right' }}>
                    <Text strong style={{ fontSize: 16 }}>
                      {formatCurrency(customer.total)}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Schnellzugriff">
            <Space size="large" wrap>
              <Link to="/invoices">
                <Button type="primary" icon={<PlusOutlined />} size="large">
                  Neue Rechnung
                </Button>
              </Link>
              <Link to="/quotes">
                <Button icon={<FileTextOutlined />} size="large">
                  Neues Angebot
                </Button>
              </Link>
              <Link to="/customers">
                <Button icon={<TeamOutlined />} size="large">
                  Neuer Kunde
                </Button>
              </Link>
              <Link to="/payments">
                <Button icon={<DollarOutlined />} size="large">
                  Zahlung erfassen
                </Button>
              </Link>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Alerts */}
      {stats.overdueInvoices?.count > 0 && (
        <Alert
          message={`${stats.overdueInvoices.count} überfällige Rechnung(en)`}
          description={`Gesamtwert: ${formatCurrency(stats.overdueInvoices.total)}`}
          type="warning"
          showIcon
          closable
          style={{ marginTop: 16 }}
          action={
            <Link to="/invoices">
              <Button size="small" danger>
                Anzeigen
              </Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
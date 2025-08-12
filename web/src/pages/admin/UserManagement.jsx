/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission. */

import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Space, Modal, Form, Input, Select, Switch,
  Tag, Avatar, Dropdown, Menu, message, Tooltip, Badge, Drawer,
  Tabs, List, Typography, Row, Col, Alert, Popconfirm, Divider
} from 'antd';
import {
  UserAddOutlined, EditOutlined, DeleteOutlined, LockOutlined,
  UnlockOutlined, MailOutlined, EyeOutlined, MoreOutlined,
  CheckCircleOutlined, CloseCircleOutlined, KeyOutlined,
  SecurityScanOutlined, TeamOutlined, SearchOutlined
} from '@ant-design/icons';
import adminService from '../../services/admin.service';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailDrawer, setDetailDrawer] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState(null);
  const [filterActive, setFilterActive] = useState(null);
  
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({
        search: searchText,
        role: filterRole,
        active: filterActive
      });
      setUsers(data.users);
    } catch (error) {
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };
  
  const loadRoles = async () => {
    try {
      const data = await adminService.getRoles();
      setRoles(data);
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  };
  
  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [searchText, filterRole, filterActive]);
  
  const handleCreateUser = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };
  
  const handleEditUser = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      ...user,
      roleId: user.roleId?._id || user.roleId
    });
    setModalVisible(true);
  };
  
  const handleSaveUser = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingUser) {
        await adminService.updateUser(editingUser._id, values);
        message.success('User updated successfully');
      } else {
        await adminService.createUser(values);
        message.success('User created successfully');
      }
      
      setModalVisible(false);
      loadUsers();
    } catch (error) {
      message.error('Failed to save user');
    }
  };
  
  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await adminService.toggleUserStatus(userId);
      message.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      loadUsers();
    } catch (error) {
      message.error('Failed to toggle user status');
    }
  };
  
  const handleResetPassword = async (userId) => {
    Modal.confirm({
      title: 'Reset Password',
      content: 'Are you sure you want to reset this user\'s password? They will receive an email with the new password.',
      onOk: async () => {
        try {
          await adminService.resetUserPassword(userId);
          message.success('Password reset successfully');
        } catch (error) {
          message.error('Failed to reset password');
        }
      }
    });
  };
  
  const handleDeleteUser = async (userId) => {
    try {
      await adminService.deleteUser(userId);
      message.success('User deleted successfully');
      loadUsers();
    } catch (error) {
      message.error('Failed to delete user');
    }
  };
  
  const handleViewDetails = async (user) => {
    setSelectedUser(user);
    setDetailDrawer(true);
    
    // Load additional details
    try {
      const details = await adminService.getUserDetails(user._id);
      setSelectedUser({ ...user, ...details });
    } catch (error) {
      console.error('Failed to load user details:', error);
    }
  };
  
  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar style={{ backgroundColor: record.roleId?.color || '#8c8c8c' }}>
            {record.name?.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Role',
      dataIndex: 'roleId',
      key: 'role',
      render: (role, record) => (
        <Tag color={role?.color || roleColors[record.role] || '#8c8c8c'}>
          {role?.displayName || record.role?.toUpperCase()}
        </Tag>
      ),
      filters: roles.map(r => ({ text: r.displayName, value: r._id })),
      onFilter: (value, record) => record.roleId?._id === value
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Space>
          <Badge status={record.active ? 'success' : 'error'} />
          <Text type={record.active ? 'success' : 'secondary'}>
            {record.active ? 'Active' : 'Inactive'}
          </Text>
          {record.emailVerified && (
            <Tooltip title="Email verified">
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
            </Tooltip>
          )}
        </Space>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false }
      ],
      onFilter: (value, record) => record.active === value
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: date => date ? dayjs(date).fromNow() : 'Never',
      sorter: (a, b) => dayjs(a.lastLogin).unix() - dayjs(b.lastLogin).unix()
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => dayjs(date).format('DD.MM.YYYY'),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix()
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="view" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)}>
                View Details
              </Menu.Item>
              <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEditUser(record)}>
                Edit User
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item 
                key="toggle" 
                icon={record.active ? <LockOutlined /> : <UnlockOutlined />}
                onClick={() => handleToggleStatus(record._id, record.active)}
              >
                {record.active ? 'Deactivate' : 'Activate'}
              </Menu.Item>
              <Menu.Item key="password" icon={<KeyOutlined />} onClick={() => handleResetPassword(record._id)}>
                Reset Password
              </Menu.Item>
              <Menu.Item key="email" icon={<MailOutlined />}>
                Send Email
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item 
                key="delete" 
                icon={<DeleteOutlined />} 
                danger
                onClick={() => {
                  Modal.confirm({
                    title: 'Delete User',
                    content: `Are you sure you want to delete ${record.name}?`,
                    onOk: () => handleDeleteUser(record._id)
                  });
                }}
              >
                Delete User
              </Menu.Item>
            </Menu>
          }
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];
  
  const roleColors = {
    super_admin: '#f5222d',
    admin: '#ff6b35',
    manager: '#1890ff',
    staff: '#52c41a',
    viewer: '#8c8c8c',
    accountant: '#faad14'
  };
  
  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <TeamOutlined /> User Management
            </Title>
            <Text type="secondary">{users.length} users total</Text>
          </Col>
          <Col>
            <Space>
              <Input.Search
                placeholder="Search users..."
                allowClear
                onSearch={setSearchText}
                style={{ width: 250 }}
                prefix={<SearchOutlined />}
              />
              <Button type="primary" icon={<UserAddOutlined />} onClick={handleCreateUser}>
                Add User
              </Button>
            </Space>
          </Col>
        </Row>
        
        {/* Table */}
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} users`
          }}
        />
      </Card>
      
      {/* Create/Edit User Modal */}
      <Modal
        title={editingUser ? 'Edit User' : 'Create New User'}
        visible={modalVisible}
        onOk={handleSaveUser}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter name' }]}
              >
                <Input placeholder="John Doe" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Invalid email' }
                ]}
              >
                <Input placeholder="john@example.com" disabled={editingUser} />
              </Form.Item>
            </Col>
          </Row>
          
          {!editingUser && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="Password"
                  extra="Leave empty to auto-generate"
                >
                  <Input.Password placeholder="••••••••" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="sendInvite"
                  label="Send Invitation"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>
              </Col>
            </Row>
          )}
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="roleId"
                label="Role"
                rules={[{ required: true, message: 'Please select role' }]}
              >
                <Select placeholder="Select role">
                  {roles.map(role => (
                    <Option key={role._id} value={role._id}>
                      <Tag color={role.color}>{role.displayName}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="active"
                label="Active"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Optional notes..." />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* User Details Drawer */}
      <Drawer
        title="User Details"
        placement="right"
        width={600}
        onClose={() => setDetailDrawer(false)}
        visible={detailDrawer}
      >
        {selectedUser && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar size={64} style={{ backgroundColor: selectedUser.roleId?.color || '#8c8c8c' }}>
                {selectedUser.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Title level={4} style={{ marginTop: 16 }}>{selectedUser.name}</Title>
              <Text type="secondary">{selectedUser.email}</Text>
              <div style={{ marginTop: 8 }}>
                <Tag color={selectedUser.roleId?.color || '#8c8c8c'}>
                  {selectedUser.roleId?.displayName || selectedUser.role}
                </Tag>
                <Badge status={selectedUser.active ? 'success' : 'error'} text={selectedUser.active ? 'Active' : 'Inactive'} />
              </div>
            </div>
            
            <Tabs defaultActiveKey="info">
              <TabPane tab="Information" key="info">
                <List>
                  <List.Item>
                    <Text strong>User ID:</Text>
                    <Text copyable>{selectedUser._id}</Text>
                  </List.Item>
                  <List.Item>
                    <Text strong>Created:</Text>
                    <Text>{dayjs(selectedUser.createdAt).format('DD.MM.YYYY HH:mm')}</Text>
                  </List.Item>
                  <List.Item>
                    <Text strong>Last Login:</Text>
                    <Text>{selectedUser.lastLogin ? dayjs(selectedUser.lastLogin).format('DD.MM.YYYY HH:mm') : 'Never'}</Text>
                  </List.Item>
                  <List.Item>
                    <Text strong>Last IP:</Text>
                    <Text>{selectedUser.lastLoginIp || 'N/A'}</Text>
                  </List.Item>
                  <List.Item>
                    <Text strong>Email Verified:</Text>
                    {selectedUser.emailVerified ? (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <CloseCircleOutlined style={{ color: '#f5222d' }} />
                    )}
                  </List.Item>
                  <List.Item>
                    <Text strong>2FA Enabled:</Text>
                    {selectedUser.twoFactorEnabled ? (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <CloseCircleOutlined style={{ color: '#8c8c8c' }} />
                    )}
                  </List.Item>
                </List>
              </TabPane>
              
              <TabPane tab="Permissions" key="permissions">
                <Alert
                  message="Role Permissions"
                  description={`This user has the ${selectedUser.roleId?.displayName || selectedUser.role} role`}
                  type="info"
                  style={{ marginBottom: 16 }}
                />
                {selectedUser.roleId?.permissions && (
                  <List
                    dataSource={selectedUser.roleId.permissions}
                    renderItem={perm => (
                      <List.Item>
                        <Text strong>{perm.module}:</Text>
                        <Space>
                          {Object.entries(perm.actions).map(([action, allowed]) => (
                            allowed && <Tag key={action} color="blue">{action}</Tag>
                          ))}
                        </Space>
                      </List.Item>
                    )}
                  />
                )}
              </TabPane>
              
              <TabPane tab="Sessions" key="sessions">
                <List
                  dataSource={selectedUser.activeSessions || []}
                  renderItem={session => (
                    <List.Item
                      actions={[
                        <Button 
                          danger 
                          size="small"
                          onClick={() => adminService.terminateSession(selectedUser._id, session._id)}
                        >
                          Terminate
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={session.deviceInfo || 'Unknown Device'}
                        description={
                          <div>
                            <Text type="secondary">IP: {session.ipAddress}</Text>
                            <br />
                            <Text type="secondary">
                              Last activity: {dayjs(session.lastActivity).fromNow()}
                            </Text>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                  locale={{ emptyText: 'No active sessions' }}
                />
              </TabPane>
              
              <TabPane tab="Activity" key="activity">
                <List
                  dataSource={selectedUser.recentActivity || []}
                  renderItem={activity => (
                    <List.Item>
                      <List.Item.Meta
                        title={`${activity.action} - ${activity.module}`}
                        description={
                          <div>
                            <Text type="secondary">
                              {dayjs(activity.createdAt).format('DD.MM.YYYY HH:mm')}
                            </Text>
                            {activity.entityName && (
                              <>
                                <br />
                                <Text type="secondary">Entity: {activity.entityName}</Text>
                              </>
                            )}
                          </div>
                        }
                      />
                      <Tag color={activity.status === 'success' ? 'success' : 'error'}>
                        {activity.status}
                      </Tag>
                    </List.Item>
                  )}
                  locale={{ emptyText: 'No recent activity' }}
                />
              </TabPane>
            </Tabs>
          </div>
        )}
      </Drawer>
    </div>
  );
}
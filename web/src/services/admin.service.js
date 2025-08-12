/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission. */

import api from './api';

const adminService = {
  // Dashboard
  async getDashboardStats() {
    const { data } = await api.get('/admin/dashboard');
    return data;
  },
  
  // Users
  async getUsers(params = {}) {
    const { data } = await api.get('/admin/users', { params });
    return data;
  },
  
  async getUserDetails(userId) {
    const { data } = await api.get(`/admin/users/${userId}`);
    return data;
  },
  
  async createUser(userData) {
    const { data } = await api.post('/admin/users', userData);
    return data;
  },
  
  async updateUser(userId, userData) {
    const { data } = await api.put(`/admin/users/${userId}`, userData);
    return data;
  },
  
  async deleteUser(userId) {
    const { data } = await api.delete(`/admin/users/${userId}`);
    return data;
  },
  
  async toggleUserStatus(userId) {
    const { data } = await api.post(`/admin/users/${userId}/toggle-status`);
    return data;
  },
  
  async resetUserPassword(userId, sendEmail = true) {
    const { data } = await api.post(`/admin/users/${userId}/reset-password`, { sendEmail });
    return data;
  },
  
  async updateUserPermissions(userId, permissions) {
    const { data } = await api.put(`/admin/users/${userId}/permissions`, permissions);
    return data;
  },
  
  async getUserSessions(userId) {
    const { data } = await api.get(`/admin/users/${userId}/sessions`);
    return data;
  },
  
  async terminateSession(userId, sessionId) {
    const { data } = await api.delete(`/admin/users/${userId}/sessions/${sessionId}`);
    return data;
  },
  
  // Roles
  async getRoles() {
    const { data } = await api.get('/admin/roles');
    return data;
  },
  
  async getRole(roleId) {
    const { data } = await api.get(`/admin/roles/${roleId}`);
    return data;
  },
  
  async createRole(roleData) {
    const { data } = await api.post('/admin/roles', roleData);
    return data;
  },
  
  async updateRole(roleId, roleData) {
    const { data } = await api.put(`/admin/roles/${roleId}`, roleData);
    return data;
  },
  
  async deleteRole(roleId) {
    const { data } = await api.delete(`/admin/roles/${roleId}`);
    return data;
  },
  
  async cloneRole(roleId, newData) {
    const { data } = await api.post(`/admin/roles/${roleId}/clone`, newData);
    return data;
  },
  
  // Audit Logs
  async getAuditLogs(params = {}) {
    const { data } = await api.get('/admin/audit-logs', { params });
    return data;
  },
  
  async getUserActivity(userId, days = 30) {
    const { data } = await api.get(`/admin/audit-logs/user/${userId}`, { params: { days } });
    return data;
  },
  
  // System Settings
  async getSystemSettings() {
    const { data } = await api.get('/admin/settings');
    return data;
  },
  
  async updateSystemSettings(settings) {
    const { data } = await api.put('/admin/settings', settings);
    return data;
  },
  
  // Export
  async exportData(type, format = 'json') {
    const { data } = await api.get('/admin/export', { 
      params: { type, format },
      responseType: format === 'csv' ? 'blob' : 'json'
    });
    
    if (format === 'csv') {
      // Download CSV file
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-export.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    
    return data;
  }
};

export default adminService;
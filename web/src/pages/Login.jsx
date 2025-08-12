/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import React, { useState } from 'react';
import { Button, Card, Form, Input, message } from 'antd';
import { useDispatch } from 'react-redux';
import { setAuth } from '../store/slices/authSlice';
import { login } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const { data } = await login(values.email, values.password);
      dispatch(setAuth(data));
      message.success(t('auth.welcome'));
      navigate('/');
    } catch (e) {
      message.error(e?.response?.data?.message || t('auth.failed'));
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <Card title={t('auth.login')} style={{ width:360 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" label={t('auth.email')} rules={[{ required:true }]}>
            <Input placeholder="you@example.com" />
          </Form.Item>
          <Form.Item name="password" label={t('auth.password')} rules={[{ required:true }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>{t('auth.login')}</Button>
        </Form>
      </Card>
    </div>
  );
}
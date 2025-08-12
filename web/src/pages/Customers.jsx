/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Space } from 'antd';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

export default function Customers() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const load = async () => {
    const { data } = await api.get('/customers');
    setItems(data.items);
  };

  useEffect(() => { load(); }, []);

  const onCreate = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await api.post('/customers', values);
      message.success(t('customers.saved'));
      setOpen(false); form.resetFields();
      load();
    } catch (e) { /* ignore */ }
    finally { setLoading(false); }
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setOpen(true)}>{t('customers.new')}</Button>
      </Space>
      <Table rowKey="_id" dataSource={items} columns={[
        { title:t('customers.name'), dataIndex:'name' },
        { title:t('customers.email'), dataIndex:'email' },
        { title:t('customers.phone'), dataIndex:'phone' },
        { title:t('customers.address'), dataIndex:'address' }
      ]} />

      <Modal title={t('customers.new')} open={open} onOk={onCreate} confirmLoading={loading} onCancel={() => setOpen(false)}>
        <Form layout="vertical" form={form}>
          <Form.Item name="name" label={t('customers.name')} rules={[{ required:true }]}><Input /></Form.Item>
          <Form.Item name="email" label={t('customers.email')}><Input type="email" /></Form.Item>
          <Form.Item name="phone" label={t('customers.phone')}><Input /></Form.Item>
          <Form.Item name="address" label={t('customers.address')}><Input /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}
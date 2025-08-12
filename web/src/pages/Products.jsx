/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Space } from 'antd';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/products';
import { useTranslation } from 'react-i18next';

export default function Products() {
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const load = async (params = {}) => {
    setLoading(true);
    const { data } = await getProducts(params);
    setData(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onSave = async () => {
    const values = await form.validateFields();
    if (editing) await updateProduct(editing._id, values); else await createProduct(values);
    message.success(t('products.saved'));
    setOpen(false); setEditing(null); form.resetFields();
    load();
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => { setEditing(null); setOpen(true); }}>{t('products.new')}</Button>
      </Space>
      <Table rowKey="_id" loading={loading} dataSource={data.items} columns={[
        { title: t('products.sku'), dataIndex: 'sku' },
        { title: t('products.name'), dataIndex: 'name' },
        { title: t('products.price'), dataIndex: 'price' },
        { title: t('products.taxRate'), dataIndex: 'taxRate' },
        { title: t('products.unit'), dataIndex: 'unit' },
        { title: '', render:(_,r)=> <Space>
            <Button onClick={()=>{ setEditing(r); setOpen(true); form.setFieldsValue(r); }}>Edit</Button>
            <Button danger onClick={()=>{ deleteProduct(r._id).then(()=>load()); }}>Delete</Button>
          </Space> }
      ]} />

      <Modal open={open} onCancel={()=>{ setOpen(false); setEditing(null); }} onOk={onSave} title={t('products.new')}>
        <Form layout="vertical" form={form}>
          <Form.Item name="sku" label={t('products.sku')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="name" label={t('products.name')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="price" label={t('products.price')} rules={[{ required: true }]}><InputNumber min={0} style={{ width:'100%' }} /></Form.Item>
          <Form.Item name="taxRate" label={t('products.taxRate')}><InputNumber min={0} max={100} style={{ width:'100%' }} /></Form.Item>
          <Form.Item name="unit" label={t('products.unit')}><Input /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}
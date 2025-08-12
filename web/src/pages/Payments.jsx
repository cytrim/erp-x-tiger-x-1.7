/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, InputNumber, Select, DatePicker, Input, message } from 'antd';
import { list as listPayments, create as createPayment, remove as removePayment } from '../services/payments';
import { list as listInvoices } from '../services/invoices';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

export default function Payments() {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [form] = Form.useForm();

  const fetchData = async (page=1, pageSize=10) => {
    setLoading(true);
    try {
      const res = await listPayments({ page, pageSize });
      setData(res.items || res.results || res.data || res.rows || res.list || res.items || []);
      setPagination({ current: res.page, pageSize: res.pageSize, total: res.total });
    } catch (e) {
      console.error(e); message.error(t('errors.load_failed'));
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(1, 10); }, []);

  const openCreate = async () => {
    const inv = await listInvoices({ page:1, pageSize:100 });
    const items = inv.items || inv.results || inv.data || [];
    setInvoices(items);
    setOpen(true);
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, date: values.date?.toISOString() };
      await createPayment(payload);
      setOpen(false);
      form.resetFields();
      fetchData(pagination.current, pagination.pageSize);
      message.success(t('payments.created'));
    } catch (e) {
      console.error(e); message.error(t('errors.save_failed'));
    }
  };

  const handleDelete = async (record) => {
    Modal.confirm({
      title: t('common.confirm_delete'),
      onOk: async () => {
        try {
          await removePayment(record._id);
          fetchData(pagination.current, pagination.pageSize);
          message.success(t('payments.deleted'));
        } catch (e) {
          console.error(e); message.error(t('errors.delete_failed'));
        }
      }
    });
  };

  const columns = [
    { title: t('payments.invoice'), dataIndex: ['invoiceId','number'], key: 'invoice' },
    { title: t('payments.method'), dataIndex: 'method', key: 'method' },
    { title: t('payments.amount'), dataIndex: 'amount', key: 'amount' },
    { title: t('payments.currency'), dataIndex: 'currency', key: 'currency' },
    { title: t('payments.date'), dataIndex: 'date', key: 'date', render: v => v ? dayjs(v).format('YYYY-MM-DD') : '' },
    { title: t('payments.reference'), dataIndex: 'reference', key: 'reference' },
    { title: t('payments.status'), dataIndex: 'status', key: 'status' },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button danger size="small" onClick={() => handleDelete(record)}>{t('common.delete')}</Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <Button type="primary" onClick={openCreate}>{t('payments.add')}</Button>
      </Space>
      <Table
        rowKey="_id"
        dataSource={data}
        columns={columns}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => fetchData(page, pageSize)
        }}
      />
      <Modal
        title={t('payments.add_payment')}
        open={open}
        onOk={handleCreate}
        onCancel={() => setOpen(false)}
        okText={t('common.save')}
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="invoiceId" label={t('payments.invoice')} rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={(invoices || []).map(inv => ({ value: inv._id, label: inv.number || inv._id }))}
            />
          </Form.Item>
          <Form.Item name="method" label={t('payments.method')} initialValue="cash">
            <Select
              options={[
                { value: 'cash', label: t('payments.method_cash') },
                { value: 'bank', label: t('payments.method_bank') },
                { value: 'card', label: t('payments.method_card') },
                { value: 'paypal', label: 'PayPal' },
                { value: 'other', label: t('payments.method_other') },
              ]}
            />
          </Form.Item>
          <Form.Item name="amount" label={t('payments.amount')} rules={[{ required: true }]}>
            <InputNumber style={{ width:'100%' }} min={0} step={0.01} />
          </Form.Item>
          <Form.Item name="currency" label={t('payments.currency')} initialValue="EUR">
            <Input />
          </Form.Item>
          <Form.Item name="date" label={t('payments.date')} initialValue={null}>
            <DatePicker style={{ width:'100%' }} />
          </Form.Item>
          <Form.Item name="reference" label={t('payments.reference')}>
            <Input />
          </Form.Item>
          <Form.Item name="notes" label={t('payments.notes')}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
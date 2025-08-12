/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, message, Space } from 'antd';
import { getQuotes, createQuote } from '../services/quotes';

export default function Quotes() {
  const [data, setData] = useState({ items: [], total: 0 });
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    const { data } = await getQuotes();
    setData(data);
  };

  useEffect(() => { load(); }, []);

  const onCreate = async () => {
    const values = await form.validateFields();
    values.date = values.date?.toISOString();
    values.validUntil = values.validUntil?.toISOString();
    await createQuote({ ...values, items: [] });
    message.success('Saved');
    setOpen(false); form.resetFields();
    load();
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setOpen(true)}>New Quote</Button>
      </Space>
      <Table rowKey="_id" dataSource={data.items} columns={[
        { title:'Number', dataIndex:'number' },
        { title:'Status', dataIndex:'status' },
        { title:'Date', dataIndex:'date', render: v => v ? new Date(v).toLocaleDateString() : '' },
        { title:'Total', dataIndex:['totals','gross'] }
      ]} />

      <Modal title="New Quote" open={open} onOk={onCreate} onCancel={()=>setOpen(false)}>
        <Form layout="vertical" form={form}>
          <Form.Item name="customerId" label="CustomerId" rules={[{ required:true }]}><Input /></Form.Item>
          <Form.Item name="date" label="Date"><DatePicker /></Form.Item>
          <Form.Item name="validUntil" label="Valid until"><DatePicker /></Form.Item>
          <Form.Item name="notes" label="Notes"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}
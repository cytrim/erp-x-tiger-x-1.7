/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, message, Space } from 'antd';
import { getInvoices, createInvoice } from '../services/invoices';

export default function Invoices() {
  const [data, setData] = useState({ items: [], total: 0 });
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    const { data } = await getInvoices();
    setData(data);
  };

  useEffect(() => { load(); }, []);

  const onCreate = async () => {
    const values = await form.validateFields();
    values.date = values.date?.toISOString();
    values.dueDate = values.dueDate?.toISOString();
    await createInvoice({ ...values, items: [] });
    message.success('Saved');
    setOpen(false); form.resetFields();
    load();
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setOpen(true)}>New Invoice</Button>
      </Space>
      <Table rowKey="_id" dataSource={data.items} columns={[
        { title:'Number', dataIndex:'number' },
        { title:'Status', dataIndex:'status' },
        { title:'Date', dataIndex:'date', render: v => v ? new Date(v).toLocaleDateString() : '' },
        { title:'Total', dataIndex:['totals','gross'] }
      ]} />

      <Modal title="New Invoice" open={open} onOk={onCreate} onCancel={()=>setOpen(false)}>
        <Form layout="vertical" form={form}>
          <Form.Item name="customerId" label="CustomerId" rules={[{ required:true }]}><Input /></Form.Item>
          <Form.Item name="date" label="Date"><DatePicker /></Form.Item>
          <Form.Item name="dueDate" label="Due date"><DatePicker /></Form.Item>
          <Form.Item name="notes" label="Notes"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}
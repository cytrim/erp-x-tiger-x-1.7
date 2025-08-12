/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Card, Space, message } from 'antd';
import { getPreferences, updatePreferences } from '../services/settings';
import { useTranslation } from 'react-i18next';

export default function MySettings() {
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const prefs = await getPreferences();
      form.setFieldsValue(prefs);
    } catch (e) {
      console.error(e); message.error(t('errors.load_failed'));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onSave = async () => {
    try {
      const values = await form.validateFields();
      const saved = await updatePreferences(values);
      if (values.locale) i18n.changeLanguage(values.locale);
      message.success(t('settings.saved'));
      form.setFieldsValue(saved);
    } catch (e) {
      console.error(e); message.error(t('errors.save_failed'));
    }
  };

  return (
    <Card title={t('settings.title')} loading={loading}>
      <Form layout="vertical" form={form}>
        <Form.Item name="locale" label={t('settings.locale')}>
          <Select
            options={[
              { value: 'de', label: 'Deutsch' },
              { value: 'en', label: 'English' }
            ]}
          />
        </Form.Item>
        <Form.Item name="tz" label={t('settings.timezone')}>
          <Input placeholder="Europe/Berlin" />
        </Form.Item>
        <Form.Item name="dateFormat" label={t('settings.date_format')}>
          <Input placeholder="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item name="numberFormat" label={t('settings.number_format')}>
          <Input placeholder="1,234.56" />
        </Form.Item>
        <Form.Item name="currency" label={t('settings.currency')}>
          <Input placeholder="EUR" />
        </Form.Item>
        <Form.Item name="emailSignature" label={t('settings.email_signature')}>
          <Input.TextArea rows={4} />
        </Form.Item>
        <Space>
          <Button type="primary" onClick={onSave}>{t('common.save')}</Button>
        </Space>
      </Form>
    </Card>
  );
}
/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Card, Space, message, Switch, Row, Col, Divider } from 'antd';
import { SaveOutlined, GlobalOutlined, BgColorsOutlined, BellOutlined, SettingOutlined } from '@ant-design/icons';
import { getPreferences, updatePreferences } from '../services/settings';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setLang } from '../store/slices/authSlice';

const { Option } = Select;

export default function Settings() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const prefs = await getPreferences();
      form.setFieldsValue(prefs);
    } catch (e) {
      console.error(e);
      message.error(t('errors.load_failed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSave = async () => {
    try {
      const values = await form.validateFields();
      const saved = await updatePreferences(values);
      
      // Update language if changed
      if (values.locale && values.locale !== i18n.language) {
        i18n.changeLanguage(values.locale);
        dispatch(setLang(values.locale));
      }
      
      message.success(t('settings.saved'));
      form.setFieldsValue(saved);
    } catch (e) {
      console.error(e);
      message.error(t('errors.save_failed'));
    }
  };

  return (
    <div>
      <Card 
        title={
          <Space>
            <SettingOutlined />
            {t('settings.title', 'Einstellungen')}
          </Space>
        }
        extra={
          <Button type="primary" icon={<SaveOutlined />} onClick={onSave}>
            {t('common.save', 'Speichern')}
          </Button>
        }
        loading={loading}
      >
        <Form form={form} layout="vertical">
          {/* Sprache & Region */}
          <Divider orientation="left">
            <Space>
              <GlobalOutlined />
              {t('settings.language_region', 'Sprache & Region')}
            </Space>
          </Divider>
          
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="locale" 
                label={t('settings.language', 'Sprache')}
                extra={t('settings.language_hint', 'Ändert die Anzeigesprache der Anwendung')}
              >
                <Select>
                  <Option value="de">
                    <Space>
                      🇩🇪 Deutsch
                    </Space>
                  </Option>
                  <Option value="en">
                    <Space>
                      🇬🇧 English
                    </Space>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="tz" 
                label={t('settings.timezone', 'Zeitzone')}
                extra={t('settings.timezone_hint', 'Für Zeitstempel und Termine')}
              >
                <Select>
                  <Option value="Europe/Berlin">Berlin (UTC+1)</Option>
                  <Option value="Europe/London">London (UTC+0)</Option>
                  <Option value="Europe/Paris">Paris (UTC+1)</Option>
                  <Option value="America/New_York">New York (UTC-5)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="dateFormat" 
                label={t('settings.date_format', 'Datumsformat')}
              >
                <Select>
                  <Option value="DD.MM.YYYY">DD.MM.YYYY (31.12.2025)</Option>
                  <Option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2025)</Option>
                  <Option value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</Option>
                  <Option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="numberFormat" 
                label={t('settings.number_format', 'Zahlenformat')}
              >
                <Select>
                  <Option value="1.234,56">1.234,56 (Deutsch)</Option>
                  <Option value="1,234.56">1,234.56 (English)</Option>
                  <Option value="1 234.56">1 234.56 (Französisch)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="currency" 
                label={t('settings.currency', 'Standardwährung')}
              >
                <Select>
                  <Option value="EUR">EUR (€)</Option>
                  <Option value="USD">USD ($)</Option>
                  <Option value="GBP">GBP (£)</Option>
                  <Option value="CHF">CHF</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="defaultTax" 
                label={t('settings.default_tax', 'Standard MwSt. %')}
              >
                <Select>
                  <Option value={19}>19% (Deutschland Standard)</Option>
                  <Option value={7}>7% (Deutschland ermäßigt)</Option>
                  <Option value={0}>0% (Steuerfrei)</Option>
                  <Option value={20}>20% (Österreich)</Option>
                  <Option value={21}>21% (Niederlande)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Darstellung */}
          <Divider orientation="left">
            <Space>
              <BgColorsOutlined />
              {t('settings.appearance', 'Darstellung')}
            </Space>
          </Divider>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="theme" 
                label={t('settings.theme', 'Design')}
              >
                <Select>
                  <Option value="dark">{t('settings.dark', 'Dunkel')}</Option>
                  <Option value="light">{t('settings.light', 'Hell')}</Option>
                  <Option value="system">{t('settings.system', 'System')}</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="defaultPaymentMethod" 
                label={t('settings.default_payment', 'Standard Zahlungsart')}
              >
                <Select>
                  <Option value="cash">{t('payments.method_cash', 'Bar')}</Option>
                  <Option value="bank">{t('payments.method_bank', 'Überweisung')}</Option>
                  <Option value="card">{t('payments.method_card', 'Karte')}</Option>
                  <Option value="paypal">PayPal</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Module Sichtbarkeit */}
          <Divider orientation="left">
            <Space>
              <BellOutlined />
              {t('settings.modules', 'Module & Benachrichtigungen')}
            </Space>
          </Divider>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label={t('settings.visible_modules', 'Sichtbare Module')}>
                <Row gutter={[16, 16]}>
                  <Col xs={12} sm={8}>
                    <Form.Item name={['moduleVisibility', 'invoices']} valuePropName="checked">
                      <Space>
                        <Switch />
                        <span>{t('nav.invoices', 'Rechnungen')}</span>
                      </Space>
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={8}>
                    <Form.Item name={['moduleVisibility', 'quotes']} valuePropName="checked">
                      <Space>
                        <Switch />
                        <span>{t('nav.quotes', 'Angebote')}</span>
                      </Space>
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={8}>
                    <Form.Item name={['moduleVisibility', 'products']} valuePropName="checked">
                      <Space>
                        <Switch />
                        <span>{t('nav.products', 'Produkte')}</span>
                      </Space>
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={8}>
                    <Form.Item name={['moduleVisibility', 'customers']} valuePropName="checked">
                      <Space>
                        <Switch />
                        <span>{t('nav.customers', 'Kunden')}</span>
                      </Space>
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={8}>
                    <Form.Item name={['moduleVisibility', 'payments']} valuePropName="checked">
                      <Space>
                        <Switch />
                        <span>{t('nav.payments', 'Zahlungen')}</span>
                      </Space>
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label={t('settings.notifications', 'Benachrichtigungen')}>
                <Row gutter={[16, 16]}>
                  <Col xs={12} sm={8}>
                    <Form.Item name={['notifications', 'email']} valuePropName="checked">
                      <Space>
                        <Switch />
                        <span>{t('settings.email_notifications', 'E-Mail')}</span>
                      </Space>
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={8}>
                    <Form.Item name={['notifications', 'web']} valuePropName="checked">
                      <Space>
                        <Switch />
                        <span>{t('settings.web_notifications', 'Browser')}</span>
                      </Space>
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={8}>
                    <Form.Item name={['notifications', 'telegram']} valuePropName="checked">
                      <Space>
                        <Switch />
                        <span>{t('settings.telegram_notifications', 'Telegram')}</span>
                      </Space>
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}

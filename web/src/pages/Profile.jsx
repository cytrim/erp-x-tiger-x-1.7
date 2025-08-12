/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import React, { useEffect, useState } from 'react';
import { 
  Card, Form, Input, Button, DatePicker, Select, Space, Tabs, 
  Row, Col, Upload, Avatar, message, Divider 
} from 'antd';
import { UserOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { Option } = Select;

export default function Profile() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/me/profile');
      if (data.item) {
        // Convert dates to dayjs objects for DatePicker
        const formData = { ...data.item };
        if (formData.dateOfBirth) formData.dateOfBirth = dayjs(formData.dateOfBirth);
        if (formData.startDate) formData.startDate = dayjs(formData.startDate);
        
        form.setFieldsValue(formData);
        if (formData.profilePhoto) setProfilePhoto(formData.profilePhoto);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onSave = async () => {
    try {
      const values = await form.validateFields();
      
      // Convert dayjs objects back to ISO strings
      if (values.dateOfBirth) values.dateOfBirth = values.dateOfBirth.toISOString();
      if (values.startDate) values.startDate = values.startDate.toISOString();
      
      await api.put('/me/profile', values);
      message.success(t('profile.saved', 'Profil gespeichert'));
    } catch (e) {
      console.error(e);
      message.error(t('errors.save_failed', 'Speichern fehlgeschlagen'));
    }
  };

  return (
    <div>
      <Card 
        title={t('profile.title', 'Mein Profil')}
        extra={
          <Button type="primary" icon={<SaveOutlined />} onClick={onSave}>
            {t('common.save', 'Speichern')}
          </Button>
        }
        loading={loading}
      >
        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col span={24} style={{ textAlign: 'center' }}>
            <Avatar 
              size={100} 
              icon={<UserOutlined />} 
              src={profilePhoto}
              style={{ backgroundColor: '#ff6b35' }}
            />
            <div style={{ marginTop: 16 }}>
              <Upload showUploadList={false}>
                <Button icon={<UploadOutlined />}>
                  {t('profile.change_photo', 'Foto ändern')}
                </Button>
              </Upload>
            </div>
          </Col>
        </Row>

        <Form form={form} layout="vertical">
          <Tabs defaultActiveKey="personal">
            {/* Persönliche Daten */}
            <TabPane tab={t('profile.personal_data', 'Persönliche Daten')} key="personal">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item 
                    name="firstName" 
                    label={t('profile.first_name', 'Vorname')}
                    rules={[{ required: true, message: 'Pflichtfeld' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item 
                    name="lastName" 
                    label={t('profile.last_name', 'Nachname')}
                    rules={[{ required: true, message: 'Pflichtfeld' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item name="dateOfBirth" label={t('profile.date_of_birth', 'Geburtsdatum')}>
                    <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="placeOfBirth" label={t('profile.place_of_birth', 'Geburtsort')}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="nationality" label={t('profile.nationality', 'Nationalität')}>
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item name="gender" label={t('profile.gender', 'Geschlecht')}>
                    <Select>
                      <Option value="male">{t('profile.male', 'Männlich')}</Option>
                      <Option value="female">{t('profile.female', 'Weiblich')}</Option>
                      <Option value="diverse">{t('profile.diverse', 'Divers')}</Option>
                      <Option value="prefer_not_to_say">{t('profile.no_answer', 'Keine Angabe')}</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="maritalStatus" label={t('profile.marital_status', 'Familienstand')}>
                    <Select>
                      <Option value="single">{t('profile.single', 'Ledig')}</Option>
                      <Option value="married">{t('profile.married', 'Verheiratet')}</Option>
                      <Option value="divorced">{t('profile.divorced', 'Geschieden')}</Option>
                      <Option value="widowed">{t('profile.widowed', 'Verwitwet')}</Option>
                      <Option value="partnership">{t('profile.partnership', 'Lebenspartnerschaft')}</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="employeeId" label={t('profile.employee_id', 'Personalnummer')}>
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            {/* Kontaktdaten */}
            <TabPane tab={t('profile.contact', 'Kontaktdaten')} key="contact">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="personalEmail" label={t('profile.personal_email', 'Private E-Mail')}>
                    <Input type="email" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="personalPhone" label={t('profile.personal_phone', 'Festnetz')}>
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="mobilePhone" label={t('profile.mobile', 'Mobiltelefon')}>
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Divider>{t('profile.address', 'Adresse')}</Divider>

              <Row gutter={16}>
                <Col xs={24} sm={16}>
                  <Form.Item name="street" label={t('profile.street', 'Straße')}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="houseNumber" label={t('profile.house_number', 'Hausnummer')}>
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item name="postalCode" label={t('profile.postal_code', 'PLZ')}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={16}>
                  <Form.Item name="city" label={t('profile.city', 'Stadt')}>
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="state" label={t('profile.state', 'Bundesland')}>
                    <Select>
                      <Option value="BW">Baden-Württemberg</Option>
                      <Option value="BY">Bayern</Option>
                      <Option value="BE">Berlin</Option>
                      <Option value="BB">Brandenburg</Option>
                      <Option value="HB">Bremen</Option>
                      <Option value="HH">Hamburg</Option>
                      <Option value="HE">Hessen</Option>
                      <Option value="MV">Mecklenburg-Vorpommern</Option>
                      <Option value="NI">Niedersachsen</Option>
                      <Option value="NW">Nordrhein-Westfalen</Option>
                      <Option value="RP">Rheinland-Pfalz</Option>
                      <Option value="SL">Saarland</Option>
                      <Option value="SN">Sachsen</Option>
                      <Option value="ST">Sachsen-Anhalt</Option>
                      <Option value="SH">Schleswig-Holstein</Option>
                      <Option value="TH">Thüringen</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="country" label={t('profile.country', 'Land')}>
                    <Input defaultValue="Deutschland" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider>{t('profile.emergency_contact', 'Notfallkontakt')}</Divider>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name={['emergencyContact', 'name']} label={t('profile.emergency_name', 'Name')}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={['emergencyContact', 'relationship']} label={t('profile.relationship', 'Beziehung')}>
                    <Input placeholder="z.B. Ehepartner, Eltern" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name={['emergencyContact', 'phone']} label={t('profile.emergency_phone', 'Telefon')}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={['emergencyContact', 'email']} label={t('profile.emergency_email', 'E-Mail')}>
                    <Input type="email" />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            {/* Arbeitsdaten */}
            <TabPane tab={t('profile.employment', 'Arbeitsdaten')} key="employment">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="department" label={t('profile.department', 'Abteilung')}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="position" label={t('profile.position', 'Position')}>
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="startDate" label={t('profile.start_date', 'Eintrittsdatum')}>
                    <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="contractType" label={t('profile.contract_type', 'Vertragsart')}>
                    <Select>
                      <Option value="permanent">{t('profile.permanent', 'Unbefristet')}</Option>
                      <Option value="temporary">{t('profile.temporary', 'Befristet')}</Option>
                      <Option value="freelance">{t('profile.freelance', 'Freiberuflich')}</Option>
                      <Option value="internship">{t('profile.internship', 'Praktikum')}</Option>
                      <Option value="apprentice">{t('profile.apprentice', 'Ausbildung')}</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item name="workingHours" label={t('profile.working_hours', 'Wochenstunden')}>
                    <Input type="number" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="vacationDays" label={t('profile.vacation_days', 'Urlaubstage')}>
                    <Input type="number" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="taxClass" label={t('profile.tax_class', 'Steuerklasse')}>
                    <Select>
                      <Option value="1">I</Option>
                      <Option value="2">II</Option>
                      <Option value="3">III</Option>
                      <Option value="4">IV</Option>
                      <Option value="5">V</Option>
                      <Option value="6">VI</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            {/* Sozialversicherung & Bank */}
            <TabPane tab={t('profile.insurance_bank', 'Versicherung & Bank')} key="insurance">
              <Divider>{t('profile.social_insurance', 'Sozialversicherung')}</Divider>
              
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="socialSecurityNumber" label={t('profile.social_security', 'Sozialversicherungsnummer')}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="taxId" label={t('profile.tax_id', 'Steuer-ID')}>
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name={['healthInsurance', 'company']} label={t('profile.health_insurance', 'Krankenkasse')}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={6}>
                  <Form.Item name={['healthInsurance', 'insuranceNumber']} label={t('profile.insurance_number', 'Versicherungsnr.')}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={6}>
                  <Form.Item name={['healthInsurance', 'type']} label={t('profile.insurance_type', 'Art')}>
                    <Select>
                      <Option value="public">{t('profile.public', 'Gesetzlich')}</Option>
                      <Option value="private">{t('profile.private', 'Privat')}</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Divider>{t('profile.bank_details', 'Bankverbindung')}</Divider>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name={['bankAccount', 'accountHolder']} label={t('profile.account_holder', 'Kontoinhaber')}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={['bankAccount', 'bankName']} label={t('profile.bank_name', 'Bank')}>
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={16}>
                  <Form.Item name={['bankAccount', 'iban']} label="IBAN">
                    <Input placeholder="DE00 0000 0000 0000 0000 00" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name={['bankAccount', 'bic']} label="BIC">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Form>
      </Card>
    </div>
  );
}
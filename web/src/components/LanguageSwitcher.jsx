/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import React from 'react';
import { Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setLang } from '../store/slices/authSlice';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const lang = useSelector((s) => s.auth.lang) || 'en';
  const dispatch = useDispatch();

  const onChange = (value) => {
    i18n.changeLanguage(value);
    dispatch(setLang(value));
  };

  return (
    <Select
      style={{ width: 120 }}
      value={lang}
      options={[{ value: 'en', label: 'English' }, { value: 'de', label: 'Deutsch' }]}
      onChange={onChange}
    />
  );
}
/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import { appTheme } from './theme';
import store from './store';
import App from './App';
import 'antd/dist/reset.css';
import './styles.css';
import './i18n';

window.addEventListener("error", (e) => { console.error("Global error:", e.error || e.message); });
window.addEventListener("unhandledrejection", (e) => { console.error("Unhandled promise:", e.reason); });
createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <ConfigProvider theme={appTheme}>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </Provider>
);
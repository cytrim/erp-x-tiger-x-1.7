/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import { theme } from 'antd';
const { darkAlgorithm } = theme;
export const appTheme = {
  algorithm: darkAlgorithm,
  token: { colorPrimary: '#ff6b35', colorLink: '#ff6b35', borderRadius: 8 },
  components: {
    Layout: { headerBg: '#141414', siderBg: '#141414', bodyBg: '#0f0f0f' },
    Menu: { itemSelectedBg: 'rgba(255,107,53,0.15)', itemSelectedColor: '#ff6b35' },
    Button: { colorPrimaryHover: '#ff875c', colorPrimaryActive: '#ff5a1c' }
  }
};
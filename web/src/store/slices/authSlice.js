/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');
const lang = localStorage.getItem('lang') || 'en';

const authSlice = createSlice({
  name: 'auth',
  initialState: { token, user, lang },
  reducers: {
    setAuth(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', state.token);
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    logout(state) {
      state.token = null; state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setLang(state, action) {
      state.lang = action.payload;
      localStorage.setItem('lang', state.lang);
    }
  }
});

export const { setAuth, logout, setLang } = authSlice.actions;
export default authSlice.reducer;
import { createSlice } from '@reduxjs/toolkit';

const userFromStorage = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user'))
  : null;

const tokenFromStorage = localStorage.getItem('access_token')
  ? JSON.parse(localStorage.getItem('access_token'))
  : null;

const initialState = {
  user: userFromStorage,
  accessToken: tokenFromStorage,
  error: null,
};

const userSlice = createSlice({
  name: 'userFeature',
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.user = action.payload.user;
      state.accessToken = action.payload.access_token;
      state.error = null;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('access_token', JSON.stringify(action.payload.access_token));
    },
    loginFailure(state, action) {
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.error = null;
      localStorage.removeItem('user');
    },
  },
});

export const { loginSuccess, loginFailure, logout } = userSlice.actions;

export default userSlice.reducer;
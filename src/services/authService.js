import api, { unwrap } from './api.js';

export const getSetupStatus = () => unwrap(api.get('/setup/status'));
export const runSetup = (payload) => unwrap(api.post('/setup', payload));
export const loginRequest = (payload) => unwrap(api.post('/auth/login', payload));
export const fetchMe = () => unwrap(api.get('/auth/me'));
export const changePasswordRequest = (payload) => unwrap(api.post('/auth/change-password', payload));

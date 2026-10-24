import api, { unwrap } from './api.js';

export const usersApi = {
  list: () => unwrap(api.get('/users')).then((d) => d.items),
  createHr: (payload) => unwrap(api.post('/users', payload)),
  setStatus: (id, isActive) => unwrap(api.patch(`/users/${id}/status`, { isActive })),
  resetPassword: (id) => unwrap(api.post(`/users/${id}/reset-password`)),
};

export const employeesApi = {
  list: (params) => unwrap(api.get('/employees', { params })),
  get: (id) => unwrap(api.get(`/employees/${id}`)),
  me: () => unwrap(api.get('/employees/me')).then((d) => d.employee),
  create: (payload) => unwrap(api.post('/employees', payload)),
  update: (id, payload) => unwrap(api.patch(`/employees/${id}`, payload)),
  updateMe: (payload) => unwrap(api.patch('/employees/me', payload)),
  setStatus: (id, payload) => unwrap(api.patch(`/employees/${id}/status`, payload)),
  resetPassword: (id) => unwrap(api.post(`/employees/${id}/reset-password`)),
  importCsv: (csv, dryRun) => unwrap(api.post('/employees/import', { csv }, { params: { dryRun } })),
  exportCsv: (params) => api.get('/employees/export', { params, responseType: 'blob' }).then((r) => r.data),
};

import api, { unwrap } from './api.js';

export const attendanceApi = {
  checkIn: (payload = { source: 'web' }) => unwrap(api.post('/attendance/check-in', payload)),
  checkOut: () => unwrap(api.post('/attendance/check-out')),
  getToday: () => unwrap(api.get('/attendance/today')),
  getMyHistory: (month) => unwrap(api.get('/attendance/me', { params: { month } })),
  getBoard: (params) => unwrap(api.get('/attendance/board', { params })),
  getCalendar: (employeeId, month) => unwrap(api.get(`/attendance/calendar/${employeeId}`, { params: { month } })),
};

export const correctionsApi = {
  list: (params) => unwrap(api.get('/corrections', { params })),
  create: (payload) => unwrap(api.post('/corrections', payload)),
  approve: (id, comment) => unwrap(api.patch(`/corrections/${id}/approve`, { comment })),
  reject: (id, comment) => unwrap(api.patch(`/corrections/${id}/reject`, { comment })),
};

export const leaveApi = {
  list: (params) => unwrap(api.get('/leaves', { params })),
  getBalance: (employeeId) => unwrap(api.get('/leaves/balance', { params: employeeId ? { employeeId } : {} })),
  apply: (payload) => unwrap(api.post('/leaves', payload)),
  cancel: (id) => unwrap(api.patch(`/leaves/${id}/cancel`)),
  approve: (id, comment) => unwrap(api.patch(`/leaves/${id}/approve`, { comment })),
  reject: (id, comment) => unwrap(api.patch(`/leaves/${id}/reject`, { comment })),
};

export const payrollApi = {
  listRuns: () => unwrap(api.get('/payroll/runs')),
  getRun: (id) => unwrap(api.get(`/payroll/runs/${id}`)),
  createRun: (month) => unwrap(api.post('/payroll/runs', { month })),
  recomputeRun: (id) => unwrap(api.post(`/payroll/runs/${id}/recompute`)),
  finalizeRun: (id) => unwrap(api.post(`/payroll/runs/${id}/finalize`)),
  listPayslips: (params) => unwrap(api.get('/payslips', { params })),
  downloadPayslipPdf: async (id, filename = 'payslip.pdf') => {
    const response = await api.get(`/payslips/${id}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export const dashboardApi = {
  getAdmin: (params) => unwrap(api.get('/dashboard/admin', { params })),
  getHr: (params) => unwrap(api.get('/dashboard/hr', { params })),
  getEmployee: () => unwrap(api.get('/dashboard/employee')),
};

export const aiApi = {
  chat: (message, history = []) => unwrap(api.post('/ai/chat', { message, history })),
  getDashboardSummary: (metrics) => unwrap(api.post('/ai/dashboard-summary', metrics)),
  smartLeave: (text) => unwrap(api.post('/ai/smart-leave', { text })),
};

export const commsApi = {
  getAnnouncements: () => unwrap(api.get('/announcements')),
  createAnnouncement: (payload) => unwrap(api.post('/announcements', payload)),
  getNotifications: () => unwrap(api.get('/notifications')),
  markNotificationRead: (id) => unwrap(api.patch(`/notifications/${id}/read`)),
  markAllNotificationsRead: () => unwrap(api.patch('/notifications/read-all')),
};

export const auditApi = {
  list: (params) => unwrap(api.get('/audit', { params })),
};

export const settingsApi = {
  get: () => unwrap(api.get('/settings')),
  update: (payload) => unwrap(api.put('/settings', payload)),
};

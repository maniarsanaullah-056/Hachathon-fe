export const ROLES = { ADMIN: 'admin', HR: 'hr', EMPLOYEE: 'employee' };

export const ROLE_LABELS = { admin: 'Admin', hr: 'HR', employee: 'Employee' };

export const NAV_ITEMS = [
  // Common / General
  { to: '/', label: 'Dashboard', icon: 'LayoutDashboard', roles: [ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE], end: true },
  
  // Employee Core
  { to: '/attendance', label: 'My Attendance', icon: 'Clock', roles: [ROLES.EMPLOYEE] },
  { to: '/leaves', label: 'Leave Center', icon: 'Calendar', roles: [ROLES.EMPLOYEE] },
  { to: '/payslips', label: 'My Payslips', icon: 'FileText', roles: [ROLES.EMPLOYEE] },
  { to: '/my-profile', label: 'My Profile', icon: 'User', roles: [ROLES.EMPLOYEE] },

  // HR & Admin Core
  { to: '/employees', label: 'Employees', icon: 'Users', roles: [ROLES.ADMIN, ROLES.HR] },
  { to: '/attendance/board', label: 'Attendance Board', icon: 'CalendarDays', roles: [ROLES.ADMIN, ROLES.HR] },
  { to: '/corrections', label: 'Corrections Inbox', icon: 'CheckSquare', roles: [ROLES.ADMIN, ROLES.HR] },
  { to: '/leaves/approvals', label: 'Leave Approvals', icon: 'CalendarCheck', roles: [ROLES.ADMIN, ROLES.HR] },
  { to: '/payroll', label: 'Payroll Runs', icon: 'DollarSign', roles: [ROLES.ADMIN, ROLES.HR] },
  { to: '/organization', label: 'Organization', icon: 'Building2', roles: [ROLES.ADMIN, ROLES.HR] },

  // Admin Only Setup & Audit
  { to: '/users', label: 'HR Logins', icon: 'UserCheck', roles: [ROLES.ADMIN] },
  { to: '/leave-settings', label: 'Quotas & Holidays', icon: 'CalendarOff', roles: [ROLES.ADMIN] },
  { to: '/company', label: 'Company Settings', icon: 'Settings', roles: [ROLES.ADMIN] },
  { to: '/audit', label: 'Audit Trail', icon: 'Shield', roles: [ROLES.ADMIN] },
  
  // Shared Comms
  { to: '/announcements', label: 'Announcements', icon: 'Megaphone', roles: [ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE] },
];

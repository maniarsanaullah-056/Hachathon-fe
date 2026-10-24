export const ROLES = { ADMIN: 'admin', HR: 'hr', EMPLOYEE: 'employee' };

export const ROLE_LABELS = { admin: 'Admin', hr: 'HR', employee: 'Employee' };

// Sidebar menu: har role ko sirf apne items dikhte hain.
// Asal permission backend check karta hai, yeh sirf UI ke liye hai.
export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', roles: [ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE], end: true },
  { to: '/my-profile', label: 'My Profile', roles: [ROLES.EMPLOYEE] },
  { to: '/employees', label: 'Employees', roles: [ROLES.ADMIN, ROLES.HR] },
  { to: '/organization', label: 'Departments & Designations', roles: [ROLES.ADMIN, ROLES.HR] },
  { to: '/users', label: 'HR Accounts', roles: [ROLES.ADMIN] },
  { to: '/leave-settings', label: 'Leave & Holidays', roles: [ROLES.ADMIN] },
  { to: '/company', label: 'Company Settings', roles: [ROLES.ADMIN] },
];

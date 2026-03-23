// ─── API URLs ──────────────────────────────────────────────────────────────────
export const apiUrls = {
  AUTH: '/api/auth',
  SITES: '/api/sites',
  EMPLOYEES: '/api/employees',
  ATTENDANCE: '/api/attendance',
  REPORTS: '/api/reports',
  USERS: '/api/users',
};

// ─── Error Messages ────────────────────────────────────────────────────────────
export const errorMessages = {
  // Auth
  INVALID_CREDENTIALS: 'Invalid email or password.',
  AUTH_REQUIRED: 'Authentication required. Please log in.',
  ADMIN_REQUIRED: 'Admin access required.',
  LOGOUT_FAILED: 'Logout failed.',

  // Employees
  EMPLOYEE_NOT_FOUND: 'Employee not found.',
  NIC_EXISTS: 'NIC already exists.',
  AT_LEAST_ONE_SITE: 'At least one site is required.',

  // Sites
  SITE_NOT_FOUND: 'Site not found.',
  SITE_NAME_EXISTS: 'Site name already exists.',
  CANNOT_DELETE_SITE_WITH_EMPLOYEES: 'Cannot delete site with active employees.',

  // Attendance
  ATTENDANCE_ALREADY_MARKED: 'Attendance already marked for today.',

  // Users
  USER_NOT_FOUND: 'User not found.',
  EMAIL_EXISTS: 'Email already exists.',
  EMAIL_IN_USE: 'Email already in use.',
  CANNOT_DELETE_DEFAULT_ADMIN: 'Cannot delete the default admin user.',
  PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters.',

  // Reports
  EMPLOYEE_ID_FROM_TO_REQUIRED: 'employee_id, from, and to are required.',
  MONTH_REQUIRED: 'month is required (YYYY-MM).',
  INVALID_FORMAT: 'Invalid format. Use json, pdf, or excel.',

  // General
  INTERNAL_SERVER_ERROR: 'Internal server error.',
  ROUTE_NOT_FOUND: 'Route not found.',
  VALIDATION_FAILED: 'Validation failed.',
};

// ─── Success Messages ──────────────────────────────────────────────────────────
export const successMessages = {
  // Auth
  LOGGED_OUT: 'Logged out successfully.',

  // Employees
  EMPLOYEE_CREATED: 'Employee created successfully.',
  EMPLOYEE_UPDATED: 'Employee updated successfully.',
  EMPLOYEE_DELETED: 'Employee deleted.',

  // Sites
  SITE_CREATED: 'Site created successfully.',
  SITE_UPDATED: 'Site updated successfully.',
  SITE_DELETED: 'Site deleted.',

  // Attendance
  ATTENDANCE_SAVED: 'Attendance saved successfully.',

  // Users
  USER_CREATED: 'User created successfully.',
  USER_UPDATED: 'User updated successfully.',
  USER_DELETED: 'User deleted.',
};

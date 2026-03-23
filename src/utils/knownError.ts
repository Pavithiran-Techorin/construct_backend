import { errorMessages } from './properties';

export const authKnownErrors: Record<string, number> = {
  [errorMessages.INVALID_CREDENTIALS]: 401,
  [errorMessages.AUTH_REQUIRED]: 401,
  [errorMessages.ADMIN_REQUIRED]: 403,
  [errorMessages.LOGOUT_FAILED]: 500,
};

export const employeeKnownErrors: Record<string, number> = {
  [errorMessages.EMPLOYEE_NOT_FOUND]: 404,
  [errorMessages.NIC_EXISTS]: 409,
};

export const siteKnownErrors: Record<string, number> = {
  [errorMessages.SITE_NOT_FOUND]: 404,
  [errorMessages.SITE_NAME_EXISTS]: 409,
  [errorMessages.CANNOT_DELETE_SITE_WITH_EMPLOYEES]: 409,
};

export const attendanceKnownErrors: Record<string, number> = {
  [errorMessages.ATTENDANCE_ALREADY_MARKED]: 409,
};

export const userKnownErrors: Record<string, number> = {
  [errorMessages.USER_NOT_FOUND]: 404,
  [errorMessages.EMAIL_EXISTS]: 409,
  [errorMessages.EMAIL_IN_USE]: 409,
  [errorMessages.CANNOT_DELETE_DEFAULT_ADMIN]: 403,
};

export const reportKnownErrors: Record<string, number> = {
  [errorMessages.EMPLOYEE_NOT_FOUND]: 404,
  [errorMessages.EMPLOYEE_ID_FROM_TO_REQUIRED]: 400,
  [errorMessages.MONTH_REQUIRED]: 400,
  [errorMessages.INVALID_FORMAT]: 400,
};

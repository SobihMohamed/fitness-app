const BASE_URL = "http://localhost:8000";

export const API = {
  // Auth Controller 
  register: `${BASE_URL}/auth/register`,
  login: `${BASE_URL}/auth/login`,
  logout: `${BASE_URL}/auth/logout`,
  forgetPassword: `${BASE_URL}/auth/forgetPassword`,
  verifyOtp: `${BASE_URL}/auth/verifyOtpAndUpdatePassword`,
  // User Controller
  profile: `${BASE_URL}/user/getProfileInfo`
};

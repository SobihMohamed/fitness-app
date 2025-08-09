export const API_CONFIG = {
  BASE_URL: "http://localhost:8000",

  // User endpoints
  USERS_API: {
    getAll: "http://localhost:8000/ManageUsers/getAllUsers",
    getById: (id: string) => `http://localhost:8000/ManageUsers/getUserById/${id}`,
    search: "http://localhost:8000/ManageUsers/searchUser",
    add: "http://localhost:8000/ManageUsers/addUser",
    filterByType: "http://localhost:8000/ManageUsers/filterByType",
    update: (id: string) => `http://localhost:8000/ManageUsers/updateUser/${id}`,
    delete: (id: string) => `http://localhost:8000/ManageUsers/deleteUser/${id}`,
  },

  // Order endpoints
  ORDERS_API: {
    getAll: "http://localhost:8000/AdminOrders/getAll",
    details: (id: string) => `http://localhost:8000/AdminOrders/showOrder/${id}`,
    filterByStatus: (status: string) => `http://localhost:8000/AdminOrders/filterByStatus/${encodeURIComponent(status)}`,
    approve: (id: string) => `http://localhost:8000/AdminOrders/approve/${id}`,
    // Backend route is spelled "canecl"
    cancel: (id: string) => `http://localhost:8000/AdminOrders/canecl/${id}`,
    delete: (id: string) => `http://localhost:8000/AdminOrders/delete/${id}`,
  },

  // Product endpoints (not used by admin tables directly here)
  PRODUCTS_API: {
    getAll: "http://localhost:8000/AdminProducts/getAll",
    getSingle: (id: string) => `http://localhost:8000/AdminProducts/getProductById/${id}`,
    add: "http://localhost:8000/AdminProducts/addCategory",
    update: (id: string) => `http://localhost:8000/AdminProducts/updateCategory/${id}`,
    delete: (id: string) => `http://localhost:8000/AdminProducts/deleteCategory/${id}`,
  },

  // Course endpoints (admin)
  COURSES_ADMIN_API: {
    getAll: "http://localhost:8000/AdminCourses/getAll",
    getSingle: (id: string) => `http://localhost:8000/AdminCourses/getCourseById/${id}`,
    add: "http://localhost:8000/AdminCourses/addCourse",
    update: (id: string) => `http://localhost:8000/AdminCourses/updateCourse/${id}`,
    delete: (id: string) => `http://localhost:8000/AdminCourses/deleteCourse/${id}`,
  },

  // Admin endpoints
  ADMINS_API: {
    login: "http://localhost:8000/admin/login",
    getAll: "http://localhost:8000/ManageAdmins/getAllAdmins",
    getById: (id: string) => `http://localhost:8000/admin/getAdminById/${id}`,
    search: "http://localhost:8000/ManageAdmins/searchAdmin",
    add: "http://localhost:8000/ManageAdmins/addAdmin",
    update: (id: string) => `http://localhost:8000/ManageAdmins/updateAdmin/${id}`,
    delete: (id: string) => `http://localhost:8000/ManageAdmins/deleteAdmin/${id}`,
  },

  // Training requests endpoints
  TRAINING_API: {
    getAll: "http://localhost:8000/AdminTrainingRequests/getAll",
    details: (id: string) => `http://localhost:8000/AdminTrainingRequests/showDetails/${id}`,
    approve: (id: string) => `http://localhost:8000/AdminTrainingRequests/approve/${id}`,
    cancel: (id: string) => `http://localhost:8000/AdminTrainingRequests/canecl/${id}`,
    delete: (id: string) => `http://localhost:8000/AdminTrainingRequests/delete/${id}`,
  },

  // Course requests endpoints
  COURSES_API: {
    getAll: "http://localhost:8000/AdminCoursesRequests/getAll",
    details: (id: string) => `http://localhost:8000/AdminCoursesRequests/showDetails/${id}`,
    approve: (id: string) => `http://localhost:8000/AdminCoursesRequests/approve/${id}`,
    cancel: (id: string) => `http://localhost:8000/AdminCoursesRequests/cancel/${id}`,
    delete: (id: string) => `http://localhost:8000/AdminCoursesRequests/delete/${id}`,
  },
};
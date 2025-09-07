export const API_CONFIG = {
  BASE_URL: "http://localhost:8000",
  TARGET_URL: "http://localhost:8000",

  // USER FUNCTIONS
  USER_FUNCTIONS: {
    auth: {
      register: "http://localhost:8000/auth/register",
      login: "http://localhost:8000/auth/login",
      logout: "http://localhost:8000/auth/logout",
      forgetPassword: "http://localhost:8000/auth/forgetPassword",
      verifyOtp: "http://localhost:8000/auth/verifyOtpAndUpdatePassword",
      refreshToken: "http://localhost:8000/auth/refreshToken",
    },
    user: {
      profile: "http://localhost:8000/user/getProfile",
      updateProfile: "http://localhost:8000/user/updateProfile",
    },
    UserCategory: {
      getAllCategory: "http://localhost:8000/Category/getAll",
      getproductsByCategoryId: (id: string) =>
        `http://localhost:8000/Category/showProductsByCategory/${id}`,
    },
    Product: {
      getAllProducts: "http://localhost:8000/Products/getAll",
      getSingleProduct: (id: string) =>
        `http://localhost:8000/Products/SingleProduct/${id}`,
      searchProductsByDescriptionOrName: "http://localhost:8000/Products/searchProduct",
    },
    Courses: {
      getAll: "http://localhost:8000/Courses/getAll",
      searchCourse: "http://localhost:8000/Courses/searchCourse",
      ViewSingleCourse: (id: string) =>
        `http://localhost:8000/Courses/singleCourse/${id}`,
    },
    RequestForTraining: {
      createRequestToAdmin: "http://localhost:8000/TrainingRequests/create",
      getAllMyRequests: "http://localhost:8000/TrainingRequests/getMyRequests",
    },
    RequestForCourses: {
      createRequestToAdmin: "http://localhost:8000/CoursesRequests/create",
      getAllMyRequests: "http://localhost:8000/CoursesRequests/getMyRequests",
      cancelRequest: (id: string) =>
        `http://localhost:8000/CoursesRequests/cancelRequest/${id}`,
      showDetails: (id: string) =>
        `http://localhost:8000/CoursesRequests/showDetails/${id}`,
    },
    RequestOreders: {
      CreateOrder: "http://localhost:8000/orders/create",
      showAllUserOrders: "http://localhost:8000/orders/myOrders",
      showSingleOrder: (id: string) =>
        `http://localhost:8000/orders/showMyOrder/${id}`,
    },
    Notifications: {
      getAllNotificationForThisUser:
        "http://localhost:8000/Notifications/getNotificationForUser",
      MarkAsRead: (id: string) =>
        `http://localhost:8000/Notifications/readNotification/${id}`,
      DeleteNotification: (id: string) =>
        `http://localhost:8000/Notifications/delete/${id}`,
    },
  },

  // USER COURSES API
  USER_COURSES_API: {
    getAll: "http://localhost:8000/Courses/getAll",
    getFeatured: "http://localhost:8000/Courses/getAll", 
    getById: (id: string) => `http://localhost:8000/Courses/singleCourse/${id}`,
    search: "http://localhost:8000/Courses/searchCourse",
    enroll: "http://localhost:8000/CoursesRequests/create",
  },

  // USER PRODUCTS API
  USER_PRODUCTS_API: {
    getAll: "http://localhost:8000/Products/getAll",
    getFeatured: "http://localhost:8000/Products/getAll", 
    getById: (id: string) => `http://localhost:8000/Products/SingleProduct/${id}`,
    search: "http://localhost:8000/Products/searchProduct",
  },

  USER_SERVICES_API: {
    getAll: "http://localhost:8000/Services/getAll",
    getById: (id: string) => `http://localhost:8000/Services/getServiceById/${id}`,
    search: "http://localhost:8000/Services/searchService",
  },
    USER_BLOG_API:{
      getAll: "http://localhost:8000/Blogs/getAll",
      getById: (id: string) => `http://localhost:8000/Blogs/singleBlog/${id}`,
      search: "http://localhost:8000/Blogs/searchBlog",
    },
  USER_BLOG_CATEGORY_API : {
  getAll: "http://localhost:8000/BlogsCategory/getAll",
  getBlogsByCategoryId: (id: string) =>
    `http://localhost:8000/BlogsCategory/showBlogsByCategory/${id}`,
},


  // ADMIN FUNCTIONS
  ADMIN_FUNCTIONS: {
    adminUsers: {
      getAll: "http://localhost:8000/ManageUsers/getAllUsers",
      getById: (id: string) =>
        `http://localhost:8000/ManageUsers/getUserById/${id}`,
      search: "http://localhost:8000/ManageUsers/searchUser",
      FilterByType: "http://localhost:8000/ManageUsers/filterByType",
      update: (id: string) =>
        `http://localhost:8000/ManageUsers/updateUser/${id}`,
      delete: (id: string) =>
        `http://localhost:8000/ManageUsers/deleteUser/${id}`,
    },
    superAdminControlleAdmins: {
      login: "http://localhost:8000/admin/login",
      getAll: "http://localhost:8000/ManageAdmins/getAllAdmins",
      getById: (id: string) =>
        `http://localhost:8000/admin/getAdminById/${id}`,
      search: "http://localhost:8000/ManageAdmins/searchAdmin",
      add: "http://localhost:8000/ManageAdmins/addAdmin",
      update: (id: string) =>
        `http://localhost:8000/ManageAdmins/updateAdmin/${id}`,
      delete: (id: string) =>
        `http://localhost:8000/ManageAdmins/deleteAdmin/${id}`,
    },
    AdminCategory: {
      getAllCategory: "http://localhost:8000/AdminCategories/getAll",
      add: "http://localhost:8000/AdminCategories/addCategory",
      update: "http://localhost:8000/AdminCategories/updateCategory",
      delete: "http://localhost:8000/AdminCategories/deleteCategory",
    },
    AdminProduct: {
      getAllProducts: "http://localhost:8000/AdminProducts/getAll",
      getSingleProduct: (id: string) =>
        `http://localhost:8000/AdminProducts/getProductById/${id}`,
      add: "http://localhost:8000/AdminProducts/addCategory",
      update: "http://localhost:8000/AdminProducts/updateCategory",
      delete: "http://localhost:8000/AdminProducts/deleteCategory",
    },
    AdminCourse: {
      getAllCourses: "http://localhost:8000/AdminCourses/getAll",
      getSingleCourse: (id: string) =>
        `http://localhost:8000/AdminCourses/getCourseById/${id}`,
      add: "http://localhost:8000/AdminCourses/addCourse",
      update: "http://localhost:8000/AdminCourses/updateCourse",
      delete: "http://localhost:8000/AdminCourses/deleteCourse",
    },
    AdminManageTrainingRequests: {
      getAllRequests: "http://localhost:8000/AdminTrainingRequests/getAll",
      showSpecificInformationAboutRequestAndUser: (id: string) =>
        `http://localhost:8000/AdminTrainingRequests/showDetails/${id}`,
      approveRequest: (id: string) =>
        `http://localhost:8000/AdminTrainingRequests/approve/${id}`,
      cancelRequest: (id: string) =>
        `http://localhost:8000/AdminTrainingRequests/canecl/${id}`,
      deleteRequest: (id: string) =>
        `http://localhost:8000/AdminTrainingRequests/delete/${id}`,
      getTheTranieesWhoseTrainingRequestEndSoon:
        "http://localhost:8000/AdminTrainingRequests/getExpirationSoon",
    },
    AdminManageCoursesRequests: {
      getAllRequests: "http://localhost:8000/AdminCoursesRequests/getAll",
      showSpecificInformationAboutRequestAndUser: (id: string) =>
        `http://localhost:8000/AdminCoursesRequests/showDetails/${id}`,
      approveRequest: (id: string) =>
        `http://localhost:8000/AdminCoursesRequests/approve/${id}`,
      cancelRequest: (id: string) =>
        `http://localhost:8000/AdminCoursesRequests/canecl/${id}`,
      deleteRequest: (id: string) =>
        `http://localhost:8000/AdminCoursesRequests/delete/${id}`,
    },
    AdminManagesOrders: {
      getAllOrders: "http://localhost:8000/AdminOrders/getAll",
      getSingleOrder: (id: string) =>
        `http://localhost:8000/AdminOrders/showOrder/${id}`,
      filterOrdersByStatus: (status: string) =>
        `http://localhost:8000/AdminOrders/filterByStatus/${encodeURIComponent(
          status
        )}`,
      approveOrder: (id: string) =>
        `http://localhost:8000/AdminOrders/approve/${id}`,
      cancelOrder: (id: string) =>
        `http://localhost:8000/AdminOrders/cancel/${id}`,
      deleteOrder: (id: string) =>
        `http://localhost:8000/AdminOrders/delete/${id}`,
    },
    AdminNotifications: {
      getAllNotificationForThisAdmin:
        "http://localhost:8000/AdminNotifications/getAdminNotifications",
      MarkAsRead: (id: string) =>
        `http://localhost:8000/AdminNotifications/readNotification/${id}`,
      DeleteNotification: (id: string) =>
        `http://localhost:8000/AdminNotifications/delete/${id}`,
    },
    AdminServices: {
      getAllServices: "http://localhost:8000/AdminServices/getAll",
      getSingleService: (id: string) =>
        `http://localhost:8000/AdminServices/getServiceById/${id}`,
      add: "http://localhost:8000/AdminServices/addService",
      update: "http://localhost:8000/AdminServices/updateService",
      delete: (id: string) =>
        `http://localhost:8000/AdminServices/deleteService/${id}`,
    },
    AdminBlogs: {
      getAllBlogs: "http://localhost:8000/AdminBlogs/getAll",
      getSingleBlog: (id: string) =>
        `http://localhost:8000/AdminBlogs/getBlogById/${id}`,
      add: "http://localhost:8000/AdminBlogs/addBlog",
      update: (id: string) =>
        `http://localhost:8000/AdminBlogs/updateBlog/${id}`,
      delete: (id: string) =>
        `http://localhost:8000/AdminBlogs/deleteBlog/${id}`,
    },
  },
};
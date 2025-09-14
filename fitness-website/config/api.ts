const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const TARGET_URL = process.env.NEXT_PUBLIC_API_TARGET_URL || BASE_URL;

export const API_CONFIG = {
  BASE_URL,
  TARGET_URL,

  // USER FUNCTIONS
  USER_FUNCTIONS: {
    auth: {
      register: `${BASE_URL}/auth/register`,
      login: `${BASE_URL}/auth/login`,
      logout: `${BASE_URL}/auth/logout`,
      forgetPassword: `${BASE_URL}/auth/forgetPassword`,
      verifyOtp: `${BASE_URL}/auth/verifyOtpAndUpdatePassword`,
      refreshToken: `${BASE_URL}/auth/refreshToken`,
    },
    
    user: {
      profile: `${BASE_URL}/user/getProfile`,
      updateProfile: `${BASE_URL}/user/updateProfile`,
    },
    
    categories: {
      getAll: `${BASE_URL}/Category/getAll`,
      getProductsByCategory: (id: string) =>
        `${BASE_URL}/Category/showProductsByCategory/${id}`,
    },
    
    products: {
      getAll: `${BASE_URL}/Products/getAll`,
      getById: (id: string) =>
        `${BASE_URL}/Products/SingleProduct/${id}`,
      search: `${BASE_URL}/Products/searchProduct`,
    },
    
    courses: {
      getAll: `${BASE_URL}/Courses/getAll`,
      getById: (id: string) =>
        `${BASE_URL}/Courses/CoursePage/${id}`,
      search: `${BASE_URL}/Courses/searchCourse`,
      modules: {
        getAll: `${BASE_URL}/AdminCourseModules/getAll`,
        getById: (id: string) => `${BASE_URL}/AdminCourseModules/getSingleModule/${id}`,
        search: `${BASE_URL}/AdminCourseModules/searchModule`
      },
      chapters: {
        getAll: `${BASE_URL}/AdminCourseChapters/getAll`,
        getById: (id: string) => `${BASE_URL}/AdminCourseChapters/getSingleChapter/${id}`,
        search: `${BASE_URL}/AdminCourseChapters/searchChapter`
      }
    },
    
    services: {
      getAll: `${BASE_URL}/Services/getAll`,
      getById: (id: string) => `${BASE_URL}/Services/singleService/${id}`,
      search: `${BASE_URL}/Services/searchService`,
    },
    
    blogs: {
      getAll: `${BASE_URL}/Blogs/getAll`,
      getById: (id: string) => `${BASE_URL}/Blogs/singleBlog/${id}`,
      search: `${BASE_URL}/Blogs/searchBlog`,
      categories: {
        getAll: `${BASE_URL}/BlogsCategory/getAll`,
        getBlogsByCategory: (id: string) =>
          `${BASE_URL}/BlogsCategory/showBlogsByCategory/${id}`,
      }
    },
    
    requests: {
      training: {
        create: `${BASE_URL}/TrainingRequests/create`,
        getMyRequests: `${BASE_URL}/TrainingRequests/getMyRequests`,
      },
      courses: {
        create: `${BASE_URL}/CoursesRequests/create`,
        getMyRequests: `${BASE_URL}/CoursesRequests/getMyRequests`,
      }
    },
    
    orders: {
      create: `${BASE_URL}/orders/create`,
      getMyOrders: `${BASE_URL}/orders/myOrders`,
      getById: (id: string) =>
        `${BASE_URL}/orders/showMyOrder/${id}`,
    },
    
    notifications: {
      getAll: `${BASE_URL}/Notifications/getNotificationForUser`,
      markAsRead: (id: string) =>
        `${BASE_URL}/Notifications/readNotification/${id}`,
      delete: (id: string) =>
        `${BASE_URL}/Notifications/delete/${id}`,
    },
  },


  // ADMIN FUNCTIONS
  ADMIN_FUNCTIONS: {
    users: {
      getAll: `${BASE_URL}/ManageUsers/getAllUsers`,
      getById: (id: string) =>
        `${BASE_URL}/ManageUsers/getUserById/${id}`,
      search: `${BASE_URL}/ManageUsers/searchUser`,
      filterByType: `${BASE_URL}/ManageUsers/filterByType`,
      add: `${BASE_URL}/ManageUsers/addUser`,
      update: (id: string) =>
        `${BASE_URL}/ManageUsers/updateUser/${id}`,
      delete: (id: string) =>
        `${BASE_URL}/ManageUsers/deleteUser/${id}`,
    },
    
    admins: {
      login: `${BASE_URL}/admin/login`,
      getAll: `${BASE_URL}/ManageAdmins/getAllAdmins`,
      getById: (id: string) =>
        `${BASE_URL}/admin/getAdminById/${id}`,
      search: `${BASE_URL}/ManageAdmins/searchAdmin`,
      add: `${BASE_URL}/ManageAdmins/addAdmin`,
      update: (id: string) =>
        `${BASE_URL}/ManageAdmins/updateAdmin/${id}`,
      delete: (id: string) =>
        `${BASE_URL}/ManageAdmins/deleteAdmin/${id}`,
    },
    
    categories: {
      getAll: `${BASE_URL}/AdminCategories/getAll`,
      add: `${BASE_URL}/AdminCategories/addCategory`,
      update: `${BASE_URL}/AdminCategories/updateCategory`,
      delete: `${BASE_URL}/AdminCategories/deleteCategory`,
    },
    
    products: {
      getAll: `${BASE_URL}/AdminProducts/getAll`,
      getById: (id: string) =>
        `${BASE_URL}/AdminProducts/getProductById/${id}`,
      search: `${BASE_URL}/AdminProducts/searchProduct`,
      add: `${BASE_URL}/AdminProducts/addProduct`,
      update: (id: string) =>
        `${BASE_URL}/AdminProducts/updateProduct/${id}`,
      delete: (id: string) =>
        `${BASE_URL}/AdminProducts/deleteProduct/${id}`,
    },
    
    courses: {
      getAll: `${BASE_URL}/AdminCourses/getAll`,
      getById: (id: string) =>
        `${BASE_URL}/AdminCourses/getCourseById/${id}`,
      search: `${BASE_URL}/AdminCourses/searchCourse`,
      add: `${BASE_URL}/AdminCourses/addCourse`,
      update: (id: string) =>
        `${BASE_URL}/AdminCourses/updateCourse/${id}`,
      delete: (id: string) =>
        `${BASE_URL}/AdminCourses/deleteCourse/${id}`,
      modules: {
        getAll: `${BASE_URL}/AdminCourseModules/getAll`,
        getById: (id: string) =>
          `${BASE_URL}/AdminCourseModules/getSingleModule/${id}`,
        search: `${BASE_URL}/AdminCourseModules/searchModule`,
        add: `${BASE_URL}/AdminCourseModules/addModule`,
        update: (id: string) =>
          `${BASE_URL}/AdminCourseModules/updateModule/${id}`,
        delete: (id: string) =>
          `${BASE_URL}/AdminCourseModules/deleteModule/${id}`,
      },
      chapters: {
        getAll: `${BASE_URL}/AdminCourseChapters/getAll`,
        getById: (id: string) =>
          `${BASE_URL}/AdminCourseChapters/getSingleChapter/${id}`,
        search: `${BASE_URL}/AdminCourseChapters/searchChapter`,
        add: `${BASE_URL}/AdminCourseChapters/addChapter`,
        update: (id: string) =>
          `${BASE_URL}/AdminCourseChapters/updateChapter/${id}`,
        delete: (id: string) =>
          `${BASE_URL}/AdminCourseChapters/deleteChapter/${id}`,
      },
    },
    
    blogs: {
      getAll: `${BASE_URL}/AdminBlogs/getAll`,
      getById: (id: string) => `${BASE_URL}/AdminBlogs/getBlogById/${id}`,
      search: `${BASE_URL}/AdminBlogs/searchBlog`,
      add: `${BASE_URL}/AdminBlogs/addBlog`,
      update: (id: string) => `${BASE_URL}/AdminBlogs/updateBlog/${id}`,
      delete: (id: string) => `${BASE_URL}/AdminBlogs/deleteBlog/${id}`,
      categories: {
        getAll: `${BASE_URL}/AdminBlogsCategory/getAll`,
        search: `${BASE_URL}/AdminBlogsCategory/searchCategory`,
        add: `${BASE_URL}/AdminBlogsCategory/addCategory`,
        update: (id: string) => `${BASE_URL}/AdminBlogsCategory/updateCategory/${id}`,
        delete: (id: string) => `${BASE_URL}/AdminBlogsCategory/deleteCategory/${id}`,
        showBlogsByCategory: (id: string) => `${BASE_URL}/AdminBlogsCategory/showBlogsByCategory/${id}`,
      }
    },
    
    services: {
      getAll: `${BASE_URL}/AdminServices/getAll`,
      getById: (id: string) =>
        `${BASE_URL}/AdminServices/getServiceById/${id}`,
      add: `${BASE_URL}/AdminServices/addService`,
      update: `${BASE_URL}/AdminServices/updateService`,
      delete: (id: string) =>
        `${BASE_URL}/AdminServices/deleteService/${id}`,
    },
    
    requests: {
      training: {
        getAll: `${BASE_URL}/AdminTrainingRequests/getAll`,
        getDetails: (id: string) =>
          `${BASE_URL}/AdminTrainingRequests/showDetails/${id}`,
        approve: (id: string) =>
          `${BASE_URL}/AdminTrainingRequests/approve/${id}`,
        cancel: (id: string) =>
          `${BASE_URL}/AdminTrainingRequests/canecl/${id}`,
        delete: (id: string) =>
          `${BASE_URL}/AdminTrainingRequests/delete/${id}`,
        getExpirationSoon:
          `${BASE_URL}/AdminTrainingRequests/getExpirationSoon`,
      },
      courses: {
        getAll: `${BASE_URL}/AdminCoursesRequests/getAll`,
        getDetails: (id: string) =>
          `${BASE_URL}/AdminCoursesRequests/showDetails/${id}`,
        approve: (id: string) =>
          `${BASE_URL}/AdminCoursesRequests/approve/${id}`,
        cancel: (id: string) =>
          `${BASE_URL}/AdminCoursesRequests/cancel/${id}`,
        delete: (id: string) =>
          `${BASE_URL}/AdminCoursesRequests/delete/${id}`,
      },
    },
    
    orders: {
      getAll: `${BASE_URL}/AdminOrders/getAll`,
      getById: (id: string) =>
        `${BASE_URL}/AdminOrders/showOrder/${id}`,
      filterByStatus: (status: string) =>
        `${BASE_URL}/AdminOrders/filterByStatus/${encodeURIComponent(
          status
        )}`,
      approve: (id: string) =>
        `${BASE_URL}/AdminOrders/approve/${id}`,
      cancel: (id: string) =>
        `${BASE_URL}/AdminOrders/canecl/${id}`,
      delete: (id: string) =>
        `${BASE_URL}/AdminOrders/delete/${id}`,
    },
    
    notifications: {
      getAll: `${BASE_URL}/AdminNotifications/getAdminNotifications`,
      markAsRead: (id: string) =>
        `${BASE_URL}/AdminNotifications/readNotification/${id}`,
      delete: (id: string) =>
        `${BASE_URL}/AdminNotifications/delete/${id}`,
    },
    
    promoCodes: {
      getAll: `${BASE_URL}/AdminPromoCodes/getAll`,
      getById: (id: string) => `${BASE_URL}/AdminPromoCodes/getSinglePromoCode/${id}`,
      add: `${BASE_URL}/AdminPromoCodes/addPromoCode`,
      update: `${BASE_URL}/AdminPromoCodes/updatePromoCode`,
      delete: `${BASE_URL}/AdminPromoCodes/deletePromoCode`,
    },
  },
};
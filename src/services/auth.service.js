import api from "./api";

export const authService = {
  // Employee login
  login: (email, password, isAdmin = false) => {
    const endpoint = isAdmin ? "/auth/admin/login" : "/auth/staff/login";
    return api.post(endpoint, { email, password });
  },

  // Employee registration
  register: (userData) => {
    return api.post("/auth/register", userData);
  },

  // Verify token validity
  verifyToken: async (token) => {
    try {
      await api.get("/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return true;
    } catch {
      return false;
    }
  },

  // Refresh token (if backend supports it)
  refreshToken: () => {
    return api.post("/auth/refresh");
  },
};

// Employee API calls
export const employeeAPI = {
  getProfile: (id) => api.get(`/staff/profile/${id}`),

  updateProfile: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    return api.put(`/employees/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  changePassword: (id, oldPassword, newPassword) => {
    return api.put(`/employees/${id}/password`, {
      oldPassword,
      newPassword,
    });
  },
};

// Attendance API calls
export const attendanceAPI = {
  clockIn: (userId) => {
    return api.post("/staff/create-attendance", {
      id_karyawan: userId,
      tanggal: new Date().toISOString(),
      status: "masuk",
    });
  },

  clockOut: (userId) => {
    return api.post("/staff/create-attendance", {
      id_karyawan: userId,
      tanggal: new Date().toISOString(),
      status: "pulang",
    });
  },

  getTodayStatus: (userId) => {
    const today = new Date().toISOString().split("T")[0];
    return api.get(`/attendance/today/${userId}`, {
      params: { date: today },
    });
  },

  getSummary: (userId, startDate, endDate) => {
    return api.get(`/attendance/summary/${userId}`, {
      params: { startDate, endDate },
    });
  },

  getAllAttendance: (filters = {}) => {
    return api.get("/attendance", { params: filters });
  },
};

// Admin API calls
export const adminAPI = {
  getAllEmployees: (page = 1, limit = 10, search = "") => {
    return api.get("/admin/employees", {
      params: { page, limit, search },
    });
  },

  createEmployee: (employeeData) => {
    return api.post("/admin/employees", employeeData);
  },

  updateEmployee: (id, employeeData) => {
    return api.put(`/admin/employees/${id}`, employeeData);
  },

  deleteEmployee: (id) => {
    return api.delete(`/admin/employees/${id}`);
  },

  getAttendanceReport: (filters = {}) => {
    return api.get("/admin/attendance/report", { params: filters });
  },
};

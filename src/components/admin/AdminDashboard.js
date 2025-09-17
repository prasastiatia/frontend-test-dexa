import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { adminAPI, attendanceAPI } from "../../services/auth.service";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    todayAttendance: {
      present: 0,
      absent: 0,
      incomplete: 0,
    },
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();

    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch employees data
      const employeesResponse = await adminAPI.getAllEmployees(1, 100);
      const employees = employeesResponse.data.employees || [];

      // Fetch today's attendance
      const today = new Date().toISOString().split("T")[0];
      const attendanceResponse = await adminAPI.getAttendanceReport({
        date: today,
      });
      const todayAttendance = attendanceResponse.data || [];

      // Calculate statistics
      const present = todayAttendance.filter(
        (record) => record.clockIn && record.clockOut
      ).length;

      const incomplete = todayAttendance.filter(
        (record) => record.clockIn && !record.clockOut
      ).length;

      const absent = employees.length - (present + incomplete);

      setDashboardData({
        totalEmployees: employees.length,
        activeEmployees: employees.filter((emp) => emp.status === "active")
          .length,
        todayAttendance: {
          present,
          absent: Math.max(0, absent),
          incomplete,
        },
        recentActivity: todayAttendance.slice(0, 5), // Last 5 activities
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) => {
    return (
      date.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }) +
      " - " +
      date.toLocaleTimeString("id-ID")
    );
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>Admin Dashboard</h2>
              <p className="text-muted mb-0">Welcome back, {user?.name}</p>
            </div>
            <div className="text-end">
              <small className="text-muted">
                {formatDateTime(currentTime)}
              </small>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="row mb-4">
            <div className="col-xl-3 col-lg-6 col-md-6 mb-4">
              <div className="card bg-primary text-white h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title text-uppercase mb-1">
                        Total Employees
                      </h6>
                      <h3 className="mb-0">{dashboardData.totalEmployees}</h3>
                      <small className="opacity-75">
                        {dashboardData.activeEmployees} Active
                      </small>
                    </div>
                    <div className="text-end">
                      <i
                        className="bi bi-people-fill"
                        style={{ fontSize: "2.5rem", opacity: 0.8 }}
                      ></i>
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-transparent border-0 p-3">
                  <Link
                    to="/admin/employees"
                    className="text-white text-decoration-none small"
                  >
                    <i className="bi bi-arrow-right me-1"></i>
                    Manage Employees
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-lg-6 col-md-6 mb-4">
              <div className="card bg-success text-white h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title text-uppercase mb-1">
                        Present Today
                      </h6>
                      <h3 className="mb-0">
                        {dashboardData.todayAttendance.present}
                      </h3>
                      <small className="opacity-75">Complete Attendance</small>
                    </div>
                    <div className="text-end">
                      <i
                        className="bi bi-check-circle-fill"
                        style={{ fontSize: "2.5rem", opacity: 0.8 }}
                      ></i>
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-transparent border-0 p-3">
                  <Link
                    to="/admin/attendance"
                    className="text-white text-decoration-none small"
                  >
                    <i className="bi bi-arrow-right me-1"></i>
                    View Attendance
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-lg-6 col-md-6 mb-4">
              <div className="card bg-warning text-white h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title text-uppercase mb-1">
                        Incomplete
                      </h6>
                      <h3 className="mb-0">
                        {dashboardData.todayAttendance.incomplete}
                      </h3>
                      <small className="opacity-75">Clock In Only</small>
                    </div>
                    <div className="text-end">
                      <i
                        className="bi bi-clock-history"
                        style={{ fontSize: "2.5rem", opacity: 0.8 }}
                      ></i>
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-transparent border-0 p-3">
                  <Link
                    to="/admin/attendance"
                    className="text-white text-decoration-none small"
                  >
                    <i className="bi bi-arrow-right me-1"></i>
                    Check Details
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-lg-6 col-md-6 mb-4">
              <div className="card bg-danger text-white h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title text-uppercase mb-1">
                        Absent Today
                      </h6>
                      <h3 className="mb-0">
                        {dashboardData.todayAttendance.absent}
                      </h3>
                      <small className="opacity-75">No Check-in</small>
                    </div>
                    <div className="text-end">
                      <i
                        className="bi bi-x-circle-fill"
                        style={{ fontSize: "2.5rem", opacity: 0.8 }}
                      ></i>
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-transparent border-0 p-3">
                  <Link
                    to="/admin/attendance"
                    className="text-white text-decoration-none small"
                  >
                    <i className="bi bi-arrow-right me-1"></i>
                    View Report
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="row">
            <div className="col-lg-8 mb-4">
              <div className="card h-100">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-activity me-2"></i>
                    Recent Activity
                  </h5>
                </div>
                <div className="card-body">
                  {dashboardData.recentActivity.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Employee</th>
                            <th>Action</th>
                            <th>Time</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.recentActivity.map(
                            (activity, index) => (
                              <tr key={index}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <img
                                      src={
                                        activity.employeePhoto ||
                                        "/default-avatar.png"
                                      }
                                      alt="Avatar"
                                      className="rounded-circle me-2"
                                      width="30"
                                      height="30"
                                      style={{ objectFit: "cover" }}
                                    />
                                    <div>
                                      <div className="fw-bold">
                                        {activity.employeeName}
                                      </div>
                                      <small className="text-muted">
                                        {activity.position}
                                      </small>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  {activity.clockOut ? "Clock Out" : "Clock In"}
                                </td>
                                <td>
                                  <small>
                                    {activity.clockOut || activity.clockIn}
                                  </small>
                                </td>
                                <td>
                                  {activity.clockOut ? (
                                    <span className="badge bg-success">
                                      Complete
                                    </span>
                                  ) : (
                                    <span className="badge bg-warning">
                                      In Progress
                                    </span>
                                  )}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <i
                        className="bi bi-inbox text-muted"
                        style={{ fontSize: "3rem" }}
                      ></i>
                      <p className="text-muted mt-2">
                        No recent activity today
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-lightning-charge me-2"></i>
                    Quick Actions
                  </h5>
                </div>
                <div className="card-body">
                  <div className="d-grid gap-2">
                    <Link
                      to="/admin/employees"
                      className="btn btn-outline-primary"
                    >
                      <i className="bi bi-person-plus me-2"></i>
                      Add New Employee
                    </Link>

                    <Link
                      to="/admin/attendance"
                      className="btn btn-outline-info"
                    >
                      <i className="bi bi-calendar-check me-2"></i>
                      Today's Attendance
                    </Link>

                    <button
                      className="btn btn-outline-success"
                      onClick={fetchDashboardData}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Refresh Data
                    </button>

                    <div className="dropdown">
                      <button
                        className="btn btn-outline-secondary dropdown-toggle w-100"
                        type="button"
                        data-bs-toggle="dropdown"
                      >
                        <i className="bi bi-download me-2"></i>
                        Export Reports
                      </button>
                      <ul className="dropdown-menu w-100">
                        <li>
                          <button className="dropdown-item">
                            <i className="bi bi-file-excel me-2"></i>
                            Attendance Report
                          </button>
                        </li>
                        <li>
                          <button className="dropdown-item">
                            <i className="bi bi-file-pdf me-2"></i>
                            Employee List
                          </button>
                        </li>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                        <li>
                          <button className="dropdown-item">
                            <i className="bi bi-calendar-range me-2"></i>
                            Monthly Summary
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Overview Chart */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-bar-chart me-2"></i>
                    Today's Attendance Overview
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-8">
                      {/* Progress bars for visual representation */}
                      <div className="mb-3">
                        <div className="d-flex justify-content-between">
                          <span>Present</span>
                          <span>
                            {dashboardData.todayAttendance.present} /{" "}
                            {dashboardData.totalEmployees}
                          </span>
                        </div>
                        <div className="progress mb-2">
                          <div
                            className="progress-bar bg-success"
                            style={{
                              width: `${
                                (dashboardData.todayAttendance.present /
                                  dashboardData.totalEmployees) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="d-flex justify-content-between">
                          <span>Incomplete</span>
                          <span>
                            {dashboardData.todayAttendance.incomplete} /{" "}
                            {dashboardData.totalEmployees}
                          </span>
                        </div>
                        <div className="progress mb-2">
                          <div
                            className="progress-bar bg-warning"
                            style={{
                              width: `${
                                (dashboardData.todayAttendance.incomplete /
                                  dashboardData.totalEmployees) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="d-flex justify-content-between">
                          <span>Absent</span>
                          <span>
                            {dashboardData.todayAttendance.absent} /{" "}
                            {dashboardData.totalEmployees}
                          </span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar bg-danger"
                            style={{
                              width: `${
                                (dashboardData.todayAttendance.absent /
                                  dashboardData.totalEmployees) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="text-center">
                        <h2 className="display-4 text-primary mb-1">
                          {Math.round(
                            (dashboardData.todayAttendance.present /
                              dashboardData.totalEmployees) *
                              100
                          ) || 0}
                          %
                        </h2>
                        <p className="text-muted">Attendance Rate</p>

                        <div className="mt-4">
                          <div className="d-flex justify-content-between text-sm mb-1">
                            <span className="text-success">
                              <i className="bi bi-circle-fill me-1"></i>
                              Complete
                            </span>
                            <span className="text-warning">
                              <i className="bi bi-circle-fill me-1"></i>
                              Pending
                            </span>
                            <span className="text-danger">
                              <i className="bi bi-circle-fill me-1"></i>
                              Absent
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

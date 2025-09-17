import React, { useState, useEffect } from "react";
import { adminAPI } from "../../services/auth.service";

const AttendanceMonitoring = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split("T")[0],
    startDate: "",
    endDate: "",
    status: "all",
    employeeName: "",
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    present: 0,
    incomplete: 0,
    absent: 0,
  });

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  useEffect(() => {
    filterData();
  }, [attendanceData, filters]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAttendanceReport({
        date: filters.date || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      setAttendanceData(response.data || []);
    } catch (error) {
      console.error("Failed to fetch attendance data:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = [...attendanceData];

    // Filter by employee name
    if (filters.employeeName) {
      filtered = filtered.filter((record) =>
        record.employeeName
          ?.toLowerCase()
          .includes(filters.employeeName.toLowerCase())
      );
    }

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter((record) => {
        switch (filters.status) {
          case "present":
            return record.clockIn && record.clockOut;
          case "incomplete":
            return record.clockIn && !record.clockOut;
          case "absent":
            return !record.clockIn;
          default:
            return true;
        }
      });
    }

    setFilteredData(filtered);

    // Calculate statistics
    const stats = {
      total: filtered.length,
      present: filtered.filter((record) => record.clockIn && record.clockOut)
        .length,
      incomplete: filtered.filter(
        (record) => record.clockIn && !record.clockOut
      ).length,
      absent: filtered.filter((record) => !record.clockIn).length,
    };
    setStatistics(stats);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = () => {
    fetchAttendanceData();
  };

  const resetFilters = () => {
    setFilters({
      date: new Date().toISOString().split("T")[0],
      startDate: "",
      endDate: "",
      status: "all",
      employeeName: "",
    });
  };

  const calculateWorkingHours = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return "-";

    const start = new Date(`2000-01-01 ${clockIn}`);
    const end = new Date(`2000-01-01 ${clockOut}`);
    const diff = (end - start) / (1000 * 60 * 60);

    return `${diff.toFixed(1)}h`;
  };

  const getStatusBadge = (record) => {
    if (record.clockOut) {
      return <span className="badge bg-success">Complete</span>;
    } else if (record.clockIn) {
      return <span className="badge bg-warning">In Progress</span>;
    } else {
      return <span className="badge bg-danger">Absent</span>;
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Employee Name",
      "Position",
      "Date",
      "Clock In",
      "Clock Out",
      "Working Hours",
      "Status",
    ];
    const csvData = [
      headers,
      ...filteredData.map((record) => [
        record.employeeName || "",
        record.position || "",
        record.date || "",
        record.clockIn || "",
        record.clockOut || "",
        calculateWorkingHours(record.clockIn, record.clockOut),
        record.clockOut
          ? "Complete"
          : record.clockIn
          ? "In Progress"
          : "Absent",
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `attendance-report-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Attendance Monitoring</h2>
            <button className="btn btn-success" onClick={exportToCSV}>
              <i className="bi bi-download me-2"></i>
              Export CSV
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="card bg-primary text-white">
                <div className="card-body text-center">
                  <i className="bi bi-people-fill fs-1 mb-2"></i>
                  <h4>{statistics.total}</h4>
                  <p className="mb-0">Total Records</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-success text-white">
                <div className="card-body text-center">
                  <i className="bi bi-check-circle-fill fs-1 mb-2"></i>
                  <h4>{statistics.present}</h4>
                  <p className="mb-0">Present</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-warning text-white">
                <div className="card-body text-center">
                  <i className="bi bi-clock-history fs-1 mb-2"></i>
                  <h4>{statistics.incomplete}</h4>
                  <p className="mb-0">Incomplete</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-danger text-white">
                <div className="card-body text-center">
                  <i className="bi bi-x-circle-fill fs-1 mb-2"></i>
                  <h4>{statistics.absent}</h4>
                  <p className="mb-0">Absent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-funnel me-2"></i>
                Filters
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Specific Date</label>
                  <input
                    type="date"
                    name="date"
                    className="form-control"
                    value={filters.date}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    className="form-control"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    className="form-control"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    className="form-select"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="all">All Status</option>
                    <option value="present">Present (Complete)</option>
                    <option value="incomplete">Incomplete</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Employee Name</label>
                  <input
                    type="text"
                    name="employeeName"
                    className="form-control"
                    placeholder="Search by employee name..."
                    value={filters.employeeName}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="col-md-6 d-flex align-items-end gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={handleSearch}
                    disabled={loading}
                  >
                    <i className="bi bi-search me-1"></i>
                    Search
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={resetFilters}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                Attendance Records
                <span className="badge bg-primary ms-2">
                  {filteredData.length} records
                </span>
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading attendance data...</p>
                </div>
              ) : filteredData.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Employee</th>
                        <th>Position</th>
                        <th>Date</th>
                        <th>Clock In</th>
                        <th>Clock Out</th>
                        <th>Working Hours</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((record, index) => (
                        <tr key={index}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img
                                src={
                                  record.employeePhoto || "/default-avatar.png"
                                }
                                alt="Avatar"
                                className="rounded-circle me-2"
                                width="40"
                                height="40"
                                style={{ objectFit: "cover" }}
                              />
                              <div>
                                <div className="fw-bold">
                                  {record.employeeName}
                                </div>
                                <small className="text-muted">
                                  {record.employeeId}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark">
                              {record.position}
                            </span>
                          </td>
                          <td>
                            <strong>
                              {new Date(record.date).toLocaleDateString(
                                "id-ID",
                                {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                }
                              )}
                            </strong>
                          </td>
                          <td>
                            {record.clockIn ? (
                              <span className="text-success">
                                <i className="bi bi-clock me-1"></i>
                                {record.clockIn}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            {record.clockOut ? (
                              <span className="text-danger">
                                <i className="bi bi-clock-fill me-1"></i>
                                {record.clockOut}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <strong>
                              {calculateWorkingHours(
                                record.clockIn,
                                record.clockOut
                              )}
                            </strong>
                          </td>
                          <td>{getStatusBadge(record)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i
                    className="bi bi-inbox text-muted"
                    style={{ fontSize: "4rem" }}
                  ></i>
                  <h5 className="text-muted mt-3">
                    No attendance records found
                  </h5>
                  <p className="text-muted">
                    Try adjusting your filters or check back later.
                  </p>
                  <button
                    className="btn btn-outline-primary"
                    onClick={resetFilters}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceMonitoring;

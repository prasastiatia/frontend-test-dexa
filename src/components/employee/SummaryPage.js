import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { attendanceAPI } from "../../services/auth.service";

const SummaryPage = () => {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [statistics, setStatistics] = useState({
    totalDays: 0,
    completeDays: 0,
    incompleteDays: 0,
    absentDays: 0,
    totalWorkingHours: 0,
  });

  useEffect(() => {
    fetchAttendanceSummary();
  }, [dateRange]);

  const fetchAttendanceSummary = async () => {
    setLoading(true);
    try {
      const response = await attendanceAPI.getSummary(
        user.id,
        dateRange.startDate,
        dateRange.endDate
      );

      const data = response.data || [];
      setAttendanceData(data);
      calculateStatistics(data);
    } catch (error) {
      console.error("Failed to fetch attendance summary:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (data) => {
    const stats = {
      totalDays: data.length,
      completeDays: data.filter((record) => record.clockIn && record.clockOut)
        .length,
      incompleteDays: data.filter(
        (record) => record.clockIn && !record.clockOut
      ).length,
      absentDays: data.filter((record) => !record.clockIn).length,
      totalWorkingHours: 0,
    };

    // Calculate total working hours
    stats.totalWorkingHours = data.reduce((total, record) => {
      if (record.clockIn && record.clockOut) {
        const clockIn = new Date(`2000-01-01 ${record.clockIn}`);
        const clockOut = new Date(`2000-01-01 ${record.clockOut}`);
        const hours = (clockOut - clockIn) / (1000 * 60 * 60);
        return total + hours;
      }
      return total;
    }, 0);

    setStatistics(stats);
  };

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value,
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">Attendance Summary</h2>

          {/* Date Range Filter */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row align-items-end">
                <div className="col-md-4">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    className="form-control"
                    value={dateRange.startDate}
                    onChange={handleDateChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    className="form-control"
                    value={dateRange.endDate}
                    onChange={handleDateChange}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="col-md-4">
                  <button
                    className="btn btn-primary"
                    onClick={fetchAttendanceSummary}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Filter"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="row mb-4">
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card bg-primary text-white">
                <div className="card-body text-center">
                  <div className="card-icon mb-2">
                    <i className="bi bi-calendar-check fs-1"></i>
                  </div>
                  <h4 className="card-title">{statistics.totalDays}</h4>
                  <p className="card-text">Total Days</p>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card bg-success text-white">
                <div className="card-body text-center">
                  <div className="card-icon mb-2">
                    <i className="bi bi-check-circle fs-1"></i>
                  </div>
                  <h4 className="card-title">{statistics.completeDays}</h4>
                  <p className="card-text">Complete Days</p>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card bg-warning text-white">
                <div className="card-body text-center">
                  <div className="card-icon mb-2">
                    <i className="bi bi-clock-history fs-1"></i>
                  </div>
                  <h4 className="card-title">{statistics.incompleteDays}</h4>
                  <p className="card-text">Incomplete Days</p>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card bg-info text-white">
                <div className="card-body text-center">
                  <div className="card-icon mb-2">
                    <i className="bi bi-stopwatch fs-1"></i>
                  </div>
                  <h4 className="card-title">
                    {statistics.totalWorkingHours.toFixed(1)}
                  </h4>
                  <p className="card-text">Total Hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                Detailed Attendance Record
                <small className="text-muted ms-2">
                  ({formatDate(dateRange.startDate)} -{" "}
                  {formatDate(dateRange.endDate)})
                </small>
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : attendanceData.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th scope="col">Date</th>
                        <th scope="col">Clock In</th>
                        <th scope="col">Clock Out</th>
                        <th scope="col">Working Hours</th>
                        <th scope="col">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData.map((record, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{formatDate(record.date)}</strong>
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
                            <span className="fw-bold">
                              {calculateWorkingHours(
                                record.clockIn,
                                record.clockOut
                              )}
                            </span>
                          </td>
                          <td>{getStatusBadge(record)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="mb-3">
                    <i className="bi bi-calendar-x fs-1 text-muted"></i>
                  </div>
                  <h5 className="text-muted">No attendance records found</h5>
                  <p className="text-muted">
                    No attendance data available for the selected date range.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { attendanceAPI } from "../../services/auth.service";

const AttendancePage = () => {
  const { user } = useAuth();
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchTodayStatus();

    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const response = await attendanceAPI.getTodayStatus(user.id);
      setTodayStatus(response.data);
    } catch (error) {
      console.error("Failed to fetch today status:", error);
      setTodayStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await attendanceAPI.clockIn(user.id);
      setMessage({
        type: "success",
        text: `Successfully clocked in at ${new Date().toLocaleTimeString(
          "id-ID"
        )}`,
      });
      await fetchTodayStatus();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to clock in",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await attendanceAPI.clockOut(user.id);
      setMessage({
        type: "success",
        text: `Successfully clocked out at ${new Date().toLocaleTimeString(
          "id-ID"
        )}`,
      });
      await fetchTodayStatus();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to clock out",
      });
    } finally {
      setActionLoading(false);
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

  const calculateWorkingHours = () => {
    if (!todayStatus?.clockIn || !todayStatus?.clockOut) return null;

    const clockIn = new Date(`2000-01-01 ${todayStatus.clockIn}`);
    const clockOut = new Date(`2000-01-01 ${todayStatus.clockOut}`);
    const diff = (clockOut - clockIn) / (1000 * 60 * 60);

    return diff.toFixed(2);
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h2 className="mb-4">Attendance</h2>

          {/* Current Time Display */}
          <div className="card mb-4">
            <div className="card-body text-center">
              <h4 className="mb-0">{formatDateTime(currentTime)}</h4>
            </div>
          </div>

          {/* Message Alert */}
          {message.text && (
            <div
              className={`alert alert-${
                message.type === "error" ? "danger" : "success"
              } alert-dismissible fade show`}
              role="alert"
            >
              {message.text}
              <button
                type="button"
                className="btn-close"
                onClick={() => setMessage({ type: "", text: "" })}
              ></button>
            </div>
          )}

          {/* Today's Status */}
          {todayStatus && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Today's Status</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="text-center">
                      <h6>Clock In</h6>
                      <p
                        className={`h5 ${
                          todayStatus.clockIn ? "text-success" : "text-muted"
                        }`}
                      >
                        {todayStatus.clockIn || "Not clocked in"}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center">
                      <h6>Clock Out</h6>
                      <p
                        className={`h5 ${
                          todayStatus.clockOut ? "text-success" : "text-muted"
                        }`}
                      >
                        {todayStatus.clockOut || "Not clocked out"}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center">
                      <h6>Working Hours</h6>
                      <p className="h5 text-info">
                        {calculateWorkingHours()
                          ? `${calculateWorkingHours()} hours`
                          : "In progress"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="card">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="d-grid">
                    <button
                      className="btn btn-success btn-lg"
                      onClick={handleClockIn}
                      disabled={
                        actionLoading || (todayStatus && todayStatus.clockIn)
                      }
                    >
                      {actionLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-clock me-2"></i>
                          Clock In
                        </>
                      )}
                    </button>
                  </div>
                  {todayStatus && todayStatus.clockIn && (
                    <small className="text-success d-block text-center mt-2">
                      ✓ Already clocked in today
                    </small>
                  )}
                </div>

                <div className="col-md-6">
                  <div className="d-grid">
                    <button
                      className="btn btn-danger btn-lg"
                      onClick={handleClockOut}
                      disabled={
                        actionLoading ||
                        !todayStatus?.clockIn ||
                        todayStatus?.clockOut
                      }
                    >
                      {actionLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-clock-fill me-2"></i>
                          Clock Out
                        </>
                      )}
                    </button>
                  </div>
                  {todayStatus && todayStatus.clockOut && (
                    <small className="text-danger d-block text-center mt-2">
                      ✓ Already clocked out today
                    </small>
                  )}
                  {!todayStatus?.clockIn && (
                    <small className="text-muted d-block text-center mt-2">
                      Please clock in first
                    </small>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="card mt-4">
            <div className="card-body">
              <h6>Instructions:</h6>
              <ul className="mb-0">
                <li>Clock in when you start your work day</li>
                <li>Clock out when you finish your work day</li>
                <li>
                  Make sure to complete both actions for accurate tracking
                </li>
                <li>You can only clock in/out once per day</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;

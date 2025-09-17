import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <NavLink
          className="navbar-brand fw-bold"
          to={isAdmin ? "/admin/dashboard" : "/employee/profile"}
        >
          <i className="bi bi-building me-2"></i>
          {isAdmin ? "Admin Portal" : "WFH Attendance"}
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {isAdmin ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin/dashboard">
                    <i className="bi bi-speedometer2 me-1"></i>
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin/employees">
                    <i className="bi bi-people me-1"></i>
                    Employees
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin/attendance">
                    <i className="bi bi-calendar-check me-1"></i>
                    Attendance
                  </NavLink>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/staff/profile">
                    <i className="bi bi-person me-1"></i>
                    Profile
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/staff/create-attendance">
                    <i className="bi bi-clock me-1"></i>
                    Attendance
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/employee/summary">
                    <i className="bi bi-graph-up me-1"></i>
                    Summary
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          <div className="navbar-nav">
            <div className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle d-flex align-items-center"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                <img
                  src={user?.photoUrl || "/default-avatar.png"}
                  alt="Profile"
                  className="rounded-circle me-2"
                  width="32"
                  height="32"
                  style={{ objectFit: "cover" }}
                />
                {user?.name}
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <span className="dropdown-item-text">
                    <small className="text-muted">{user?.email}</small>
                  </span>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  {!isAdmin && (
                    <NavLink className="dropdown-item" to="/employee/profile">
                      <i className="bi bi-person me-2"></i>
                      My Profile
                    </NavLink>
                  )}
                </li>
                <li>
                  <button
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

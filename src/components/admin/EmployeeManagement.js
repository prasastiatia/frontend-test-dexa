import React, { useState, useEffect } from "react";
import { adminAPI } from "../../services/auth.service";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalEmployees: 0,
    limit: 10,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    phone: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, [pagination.currentPage, pagination.limit]);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllEmployees(
        pagination.currentPage,
        pagination.limit,
        searchTerm
      );

      setEmployees(response.data.employees || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.totalPages || 1,
        totalEmployees: response.data.totalEmployees || 0,
      }));
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = employees;

    if (searchTerm) {
      filtered = employees.filter(
        (employee) =>
          employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEmployees(filtered);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleShowModal = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        name: employee.name,
        email: employee.email,
        position: employee.position,
        phone: employee.phone || "",
        status: employee.status || "active",
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        name: "",
        email: "",
        position: "",
        phone: "",
        status: "active",
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setFormData({
      name: "",
      email: "",
      position: "",
      phone: "",
      status: "active",
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.position.trim()) {
      newErrors.position = "Position is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setActionLoading(true);

    try {
      if (editingEmployee) {
        await adminAPI.updateEmployee(editingEmployee.id, formData);
      } else {
        await adminAPI.createEmployee(formData);
      }

      handleCloseModal();
      fetchEmployees();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        `Failed to ${editingEmployee ? "update" : "create"} employee`;
      setErrors({ general: errorMessage });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEmployee = async (employee) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${employee.name}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setActionLoading(true);

    try {
      await adminAPI.deleteEmployee(employee.id);
      fetchEmployees();
    } catch (error) {
      alert("Failed to delete employee. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: newPage,
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <span className="badge bg-success">Active</span>;
      case "inactive":
        return <span className="badge bg-danger">Inactive</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>Employee Management</h2>
              <p className="text-muted mb-0">
                Manage employee accounts and information
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => handleShowModal()}
            >
              <i className="bi bi-person-plus me-2"></i>
              Add New Employee
            </button>
          </div>

          {/* Search and Statistics */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search employees by name, email, or position..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="mt-2 mt-md-0">
                <span className="badge bg-primary fs-6">
                  Total: {pagination.totalEmployees} employees
                </span>
              </div>
            </div>
          </div>

          {/* Employee Table */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                Employee List
                <span className="badge bg-secondary ms-2">
                  {filteredEmployees.length} records
                </span>
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading employees...</p>
                </div>
              ) : filteredEmployees.length > 0 ? (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Employee</th>
                          <th>Position</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEmployees.map((employee) => (
                          <tr key={employee.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={
                                    employee.photoUrl || "/default-avatar.png"
                                  }
                                  alt="Avatar"
                                  className="rounded-circle me-3"
                                  width="50"
                                  height="50"
                                  style={{ objectFit: "cover" }}
                                />
                                <div>
                                  <div className="fw-bold">{employee.name}</div>
                                  <small className="text-muted">
                                    ID: {employee.id}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark">
                                {employee.position}
                              </span>
                            </td>
                            <td>
                              <div>
                                {employee.email}
                                <br />
                                <small className="text-muted">
                                  Joined:{" "}
                                  {new Date(
                                    employee.createdAt
                                  ).toLocaleDateString()}
                                </small>
                              </div>
                            </td>
                            <td>{employee.phone || "-"}</td>
                            <td>{getStatusBadge(employee.status)}</td>
                            <td>
                              <div className="btn-group">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleShowModal(employee)}
                                  disabled={actionLoading}
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteEmployee(employee)}
                                  disabled={actionLoading}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <nav aria-label="Page navigation" className="mt-4">
                      <ul className="pagination justify-content-center">
                        <li
                          className={`page-item ${
                            pagination.currentPage === 1 ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              handlePageChange(pagination.currentPage - 1)
                            }
                            disabled={pagination.currentPage === 1}
                          >
                            Previous
                          </button>
                        </li>
                        {[...Array(pagination.totalPages)].map((_, index) => (
                          <li
                            key={index + 1}
                            className={`page-item ${
                              pagination.currentPage === index + 1
                                ? "active"
                                : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(index + 1)}
                            >
                              {index + 1}
                            </button>
                          </li>
                        ))}
                        <li
                          className={`page-item ${
                            pagination.currentPage === pagination.totalPages
                              ? "disabled"
                              : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              handlePageChange(pagination.currentPage + 1)
                            }
                            disabled={
                              pagination.currentPage === pagination.totalPages
                            }
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </>
              ) : (
                <div className="text-center py-5">
                  <i
                    className="bi bi-people text-muted"
                    style={{ fontSize: "4rem" }}
                  ></i>
                  <h5 className="text-muted mt-3">No employees found</h5>
                  <p className="text-muted">
                    {searchTerm
                      ? "Try adjusting your search terms."
                      : "Start by adding your first employee."}
                  </p>
                  {!searchTerm && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleShowModal()}
                    >
                      <i className="bi bi-person-plus me-2"></i>
                      Add First Employee
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Employee Form Modal */}
          {showModal && (
            <div
              className="modal show d-block"
              tabIndex="-1"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      <i className="bi bi-person me-2"></i>
                      {editingEmployee ? "Edit Employee" : "Add New Employee"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={handleCloseModal}
                    ></button>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                      {errors.general && (
                        <div className="alert alert-danger">
                          {errors.general}
                        </div>
                      )}

                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Full Name *</label>
                            <input
                              type="text"
                              name="name"
                              className={`form-control ${
                                errors.name ? "is-invalid" : ""
                              }`}
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="Enter full name"
                            />
                            {errors.name && (
                              <div className="invalid-feedback">
                                {errors.name}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Email Address *
                            </label>
                            <input
                              type="email"
                              name="email"
                              className={`form-control ${
                                errors.email ? "is-invalid" : ""
                              }`}
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="Enter email address"
                            />
                            {errors.email && (
                              <div className="invalid-feedback">
                                {errors.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Position *</label>
                            <input
                              type="text"
                              name="position"
                              className={`form-control ${
                                errors.position ? "is-invalid" : ""
                              }`}
                              value={formData.position}
                              onChange={handleInputChange}
                              placeholder="Enter position/job title"
                            />
                            {errors.position && (
                              <div className="invalid-feedback">
                                {errors.position}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Phone Number</label>
                            <input
                              type="tel"
                              name="phone"
                              className="form-control"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="Enter phone number"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Status</label>
                            <select
                              name="status"
                              className="form-select"
                              value={formData.status}
                              onChange={handleInputChange}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCloseModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                            ></span>
                            {editingEmployee ? "Updating..." : "Creating..."}
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check me-2"></i>
                            {editingEmployee
                              ? "Update Employee"
                              : "Create Employee"}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagement;

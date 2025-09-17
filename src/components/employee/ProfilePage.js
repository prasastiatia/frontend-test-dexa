import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { employeeAPI } from "../../services/auth.service";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  console.log("profiles==", profile);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    photo: null,
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user.id]);

  const fetchProfile = async () => {
    try {
      const response = await employeeAPI.getProfile(user.id_karyawan);
      console.log("res==", user);
      setProfile(response.data.data);
      setFormData((prev) => ({
        ...prev,
        phone: response.data.no_hp || "",
      }));
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to load profile data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === "photo") {
      setFormData({
        ...formData,
        photo: e.target.files[0],
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: "", text: "" });

    try {
      const updateData = {};

      // Add phone if changed
      if (formData.phone !== profile.phone) {
        updateData.phone = formData.phone;
      }

      // Add photo if selected
      if (formData.photo) {
        updateData.photo = formData.photo;
      }

      // Handle password change separately if provided
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setMessage({
            type: "error",
            text: "New passwords do not match",
          });
          setUpdating(false);
          return;
        }

        await employeeAPI.changePassword(
          user.id,
          formData.oldPassword,
          formData.newPassword
        );
      }

      // Update profile data
      if (Object.keys(updateData).length > 0) {
        const response = await employeeAPI.updateProfile(user.id, updateData);
        setProfile(response.data);
        updateUser(response.data);
      }

      setMessage({
        type: "success",
        text: "Profile updated successfully!",
      });

      setEditMode(false);
      setShowPasswordFields(false);
      setFormData((prev) => ({
        ...prev,
        photo: null,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setUpdating(false);
    }
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
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Employee Profile</h2>
            <button
              className="btn btn-outline-primary"
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? "Cancel" : "Edit Profile"}
            </button>
          </div>

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

          <div className="card">
            <div className="card-body">
              <div className="row">
                {/* Profile Photo Section */}
                <div className="col-md-4 text-center">
                  <div className="mb-3">
                    <img
                      src={profile.foto || "/default-avatar.png"}
                      alt="Profile"
                      className="rounded-circle img-fluid"
                      style={{
                        width: "200px",
                        height: "200px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  {editMode && (
                    <div>
                      <input
                        type="file"
                        name="photo"
                        className="form-control"
                        accept="image/*"
                        onChange={handleChange}
                      />
                      <small className="form-text text-muted">
                        Max file size: 5MB. Formats: JPG, PNG, GIF
                      </small>
                    </div>
                  )}
                </div>

                {/* Profile Information Section */}
                <div className="col-md-8">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-bold">
                            Full Name
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={profile.nama}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-bold">
                            Company Email
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            value={profile.email}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-bold">Position</label>
                          <input
                            type="text"
                            className="form-control"
                            value={profile.posisi}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-bold">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            className="form-control"
                            value={formData.no_hp}
                            onChange={handleChange}
                            readOnly={!editMode}
                          />
                        </div>
                      </div>
                    </div>

                    {editMode && (
                      <div className="mt-4">
                        <div className="form-check mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="changePassword"
                            checked={showPasswordFields}
                            onChange={(e) =>
                              setShowPasswordFields(e.target.checked)
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor="changePassword"
                          >
                            Change Password
                          </label>
                        </div>

                        {showPasswordFields && (
                          <div className="row">
                            <div className="col-md-4">
                              <div className="mb-3">
                                <label className="form-label">
                                  Current Password
                                </label>
                                <input
                                  type="password"
                                  name="oldPassword"
                                  className="form-control"
                                  value={formData.oldPassword}
                                  onChange={handleChange}
                                  required={showPasswordFields}
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="mb-3">
                                <label className="form-label">
                                  New Password
                                </label>
                                <input
                                  type="password"
                                  name="newPassword"
                                  className="form-control"
                                  value={formData.newPassword}
                                  onChange={handleChange}
                                  required={showPasswordFields}
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="mb-3">
                                <label className="form-label">
                                  Confirm New Password
                                </label>
                                <input
                                  type="password"
                                  name="confirmPassword"
                                  className="form-control"
                                  value={formData.confirmPassword}
                                  onChange={handleChange}
                                  required={showPasswordFields}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {editMode && (
                      <div className="mt-4">
                        <button
                          type="submit"
                          className="btn btn-success me-2"
                          disabled={updating}
                        >
                          {updating ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                              ></span>
                              Updating...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            setEditMode(false);
                            setShowPasswordFields(false);
                            setFormData((prev) => ({
                              ...prev,
                              photo: null,
                              oldPassword: "",
                              newPassword: "",
                              confirmPassword: "",
                            }));
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

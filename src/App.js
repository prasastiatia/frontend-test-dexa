import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Layout from "./components/common/Layout";

// Employee Components
import LoginPage from "./components/employee/LoginPage";
import RegisterPage from "./components/employee/RegisterPage";
import ProfilePage from "./components/employee/ProfilePage";
import AttendancePage from "./components/employee/AttendancePage";
import SummaryPage from "./components/employee/SummaryPage";

// Admin Components
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import EmployeeManagement from "./components/admin/EmployeeManagement";
import AttendanceMonitoring from "./components/admin/AttendanceMonitoring";

import "./styles/app.css";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Employee Routes */}
            <Route
              path="/staff/*"
              element={
                <ProtectedRoute requiredRole="employee">
                  <Layout>
                    <Routes>
                      <Route path="profile" element={<ProfilePage />} />
                      <Route
                        path="/staff/create-attendance"
                        element={<AttendancePage />}
                      />
                      <Route path="summary" element={<SummaryPage />} />
                      <Route
                        path="*"
                        element={<Navigate to="/staff/profile" />}
                      />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route
                        path="employees"
                        element={<EmployeeManagement />}
                      />
                      <Route
                        path="attendance"
                        element={<AttendanceMonitoring />}
                      />
                      <Route
                        path="*"
                        element={<Navigate to="/admin/dashboard" />}
                      />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

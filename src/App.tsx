import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import VerifyEmail from "./pages/VerifyEmail";
function App() {
  // Simple authentication check
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify/:token" element={<VerifyEmail />} />
      {/* Protected route */}
      <Route
        path="/dashboard"
        element={
          isLoggedIn ? <Dashboard /> : <Navigate to="/login" replace />
        }
      />

      {/* Redirect any unknown path */}
      <Route
        path="*"
        element={
          <Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />
        }
      />
    </Routes>
  );
}
export default App;

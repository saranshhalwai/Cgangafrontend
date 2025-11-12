import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import VerifyEmail from "./pages/VerifyEmail";
import UploadPage from "./pages/Upload";
import ViewPage from "./pages/ViewPage";
import UpdatePage from "./pages/UpdatePage";

function App() {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify/:token" element={<VerifyEmail />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/upload"
        element={isLoggedIn ? <UploadPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/update"
        element={isLoggedIn ? <UpdatePage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/view"
        element={isLoggedIn ? <ViewPage /> : <Navigate to="/login" replace />}
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
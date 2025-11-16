import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import VerifyEmail from "./pages/VerifyEmail";
import UploadPage from "./pages/Upload";
import Profile from "./pages/Profile";
import UpdatePage from "./pages/UpdatePage"
import ViewPage from  "./pages/ViewPage"
import { isLoggedIn as checkLoggedIn, isAdmin } from "./lib/auth";
import LogsPage from "@/pages/Logs.tsx";

function App() {
  // Simple authentication check
  const isLoggedIn = checkLoggedIn();
  const isUserAdmin = isAdmin();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify/:token" element={<VerifyEmail />} />
       <Route path="/profile" element={<Profile />} />
      {/* Protected route */}
      <Route
        path="/dashboard"
        element={
          isLoggedIn ? <Dashboard /> : <Navigate to="/login" replace />

        }
      />

      <Route path="/UpdatePage"
        element={isLoggedIn ? (isUserAdmin ? <UpdatePage /> : <Navigate to="/dashboard" replace />) : <Navigate to="/login" replace/>}/>

      <Route path="/ViewPage" element={isLoggedIn ? <ViewPage/> : <Navigate to="/login" replace/>}/>
      <Route path="/upload"
      element={
        isLoggedIn
          ? (isUserAdmin ? <UploadPage /> : <Navigate to="/dashboard" replace />)
          : <Navigate to="/login" replace />
      }
      />
      <Route path="/logs" element={isLoggedIn ? (isUserAdmin ? <LogsPage/> : <Navigate to="/dashboard" replace />) : <Navigate to="/login" replace/>}/>

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

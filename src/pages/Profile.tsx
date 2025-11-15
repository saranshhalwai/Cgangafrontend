import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  username?: string;
  email?: string;
  id?: number;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User>({});
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data from backend
    fetch("http://127.0.0.1:8000/simple_user") // replace with your FastAPI URL
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Error fetching user:", err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(to bottom, #d4f4dd, #ffffff)" }}
    >
      
      {/* Back Button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="self-start mb-6 px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
      >
        ← Back to Dashboard
      </button>

      {/* Profile Card */}
      <div className="bg-white shadow-2xl p-8 rounded-3xl w-full max-w-md border border-green-200 transition-all duration-300 hover:scale-105">
        
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-green-500 text-white flex items-center justify-center text-4xl font-bold shadow-lg">
            {user?.username?.[0]?.toUpperCase() || "U"}
          </div>

          {/* Username */}
          <h2 className="mt-4 text-3xl font-extrabold text-slate-800">
            {user?.username || "User"}
          </h2>

          {/* Email */}
          <p className="text-slate-500 mt-1">{user?.email || "No email"}</p>
        </div>

        {/* User Details */}
        <div className="mt-8 space-y-4">
          
          {/* User ID */}
          <div className="p-5 bg-green-50 rounded-xl shadow-inner hover:shadow-lg transition">
            <p className="text-sm text-slate-600">User ID</p>
            <p className="font-semibold text-slate-800">{user?.id || "N/A"}</p>
          </div>

          {/* Account Type */}
          <div className="p-5 bg-green-50 rounded-xl shadow-inner hover:shadow-lg transition">
            <p className="text-sm text-slate-600">Account Type</p>
            <p className="font-semibold text-slate-800">Standard User</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

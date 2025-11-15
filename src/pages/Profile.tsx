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
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-b from-[#34A0A4] to-[#52B788]">
      {/* Back Button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="self-start mb-6 px-4 py-2 bg-[#52B788] text-white rounded-lg shadow hover:bg-[#40916C] transition"
      >
        ← Back to Dashboard
      </button>

      {/* Profile Card */}
      <div className="bg-white shadow-2xl p-8 rounded-xl w-full max-w-md border border-transparent dark:bg-[#062a3a] dark:border-white/5 transition-all duration-300 hover:scale-105">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-[#52B788] text-white flex items-center justify-center text-4xl font-bold shadow-lg">
            {user?.username?.[0]?.toUpperCase() || "U"}
          </div>

          {/* Username */}
          <h2 className="mt-4 text-3xl font-extrabold text-slate-800 dark:text-white">
            {user?.username || "User"}
          </h2>

          {/* Email */}
          <p className="text-slate-500 dark:text-slate-300 mt-1">{user?.email || "No email"}</p>
        </div>

        {/* User Details */}
        <div className="mt-8 space-y-4">
          {/* User ID */}
          <div className="p-5 bg-gray-50 dark:bg-opacity-10 rounded-xl shadow-inner hover:shadow-lg transition">
            <p className="text-sm text-slate-600 dark:text-slate-300">User ID</p>
            <p className="font-semibold text-slate-800 dark:text-white">{user?.id || "N/A"}</p>
          </div>

          {/* Account Type */}
          <div className="p-5 bg-gray-50 dark:bg-opacity-10 rounded-xl shadow-inner hover:shadow-lg transition">
            <p className="text-sm text-slate-600 dark:text-slate-300">Account Type</p>
            <p className="font-semibold text-slate-800 dark:text-white">Standard User</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

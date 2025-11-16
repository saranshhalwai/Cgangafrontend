import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  username?: string;
  email?: string;
  id?: number;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User>({});
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem("user");

    if (!username) {
      setError("No username found in localStorage.");
      return;
    }

    fetch(`http://127.0.0.1:8000/simple_user?username=${username}`)
      .then((res) => {
        if (!res.ok) {
          setError("Failed to fetch user. Check backend.");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setUser(data);
      })
      .catch(() => setError("Failed to load profile."));
  }, []);

  return (
    <div
      className="min-h-screen w-full flex justify-center p-6"
      style={{
        background: "linear-gradient(to bottom, #d4f4dd, #ffffff)",
      }}
    >
      <div className="w-full max-w-xl flex flex-col">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition self-start"
        >
          ← Back to Dashboard
        </button>

        {/* Profile Card */}
        <div className="bg-white shadow-2xl p-8 rounded-3xl border border-green-200 transition-all duration-300 hover:scale-[1.02]">
          {error ? (
            <div className="text-center text-red-600 font-semibold">{error}</div>
          ) : (
            <>
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
                <p className="text-slate-500 mt-1">{user?.email || "No email available"}</p>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

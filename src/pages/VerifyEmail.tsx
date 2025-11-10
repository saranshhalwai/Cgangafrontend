import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const [message, setMessage] = useState("Verifying...");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:8000/verify/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.message?.includes("success")) {
          setMessage("Email verified successfully!");
          // redirect after 2 seconds
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setMessage(data.detail || "Verification failed!");
        }
      })
      .catch(() => setMessage("Verification failed!"));
  }, [token, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-gray-900 text-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
        <p>{message}</p>
      </div>
    </div>
  );
}

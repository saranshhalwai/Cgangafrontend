import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, MapPin } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const response = await fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        username: email,
        password: password,
        grant_type: "password",
      }),
    });

    if (response.ok) {
      const data = await response.json();

      // Save token to localStorage for future authenticated requests
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", email);

      navigate("/dashboard"); // ✅ Redirect to Dashboard
    } else {
      alert("Invalid email or password");
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("An error occurred. Please try again.");
  }
};


  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#34A0A4] to-[#52B788]">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 text-white px-10">
        <div className="text-center space-y-4">
          <MapPin className="h-12 w-12 mx-auto text-white" />
          <h1 className="text-4xl font-bold">CGanga Data Visualizer</h1>
          <p className="text-lg opacity-90">Explore Ganga River Ecosystem Data</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center w-full lg:w-1/2 bg-gray-300 shadow-2xl">
        <Card className="w-full max-h-11xl sm:max-w-5xl lg:max-w-4xl shadow-2xl rounded-4xl flex flex-col overflow-hidden mx-auto bg-[#E9F5EE]/90 backdrop-blur-lg">
          <CardContent className="p-8">
            <h2 className="text-5xl font-semibold font-[jersey-10] text-gray-800 mb-6 text-center">
              Login to Dashboard
            </h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Email"
                  className="pl-10 pr-4 py-3"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Password"
                  className="pl-10 pr-4 py-3"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="text-center text-red-500 text-sm">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-[#34A0A4] hover:bg-gray-900 text-white font-semibold py-3"
              >
                Login
              </Button>

              <p className="text-center text-sm text-gray-600">
                Don’t have an account?{" "}
                <Link to="/register" className="text-[#1E6091] hover:underline">
                  Register here
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

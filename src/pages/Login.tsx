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
    <div className="min-h-screen flex items-stretch">
      {/* Left panel: show only on large screens */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 text-white px-10 bg-gradient-to-br from-[#34A0A4] to-[#52B788]">
        <div className="text-center space-y-4">
          <MapPin className="h-12 w-12 mx-auto text-white" />
          <h1 className="text-4xl font-bold">CGanga Data Visualizer</h1>
          <p className="text-lg opacity-90">Explore Ganga River Ecosystem Data</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center w-full lg:w-1/2 p-6">
        <Card className="w-full max-w-md shadow-2xl rounded-xl overflow-hidden">
          <CardContent className="p-8 bg-white/95 dark:bg-[#062a3a]">
            <h2 className="text-2xl font-semibold text-center mb-6">Login to Dashboard</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-slate-300" />
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
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-slate-300" />
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
                className="w-full btn-primary"
              >
                Login
              </Button>

              <p className="text-center text-sm text-gray-600 dark:text-slate-300">
                Don’t have an account?{' '}
                <Link to="/register" className="text-primary hover:underline">
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

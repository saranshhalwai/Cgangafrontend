import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, Phone, MapPin } from "lucide-react";
export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const res = await fetch("http://127.0.0.1:8000/register", {
      method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json" 
        },
      body: JSON.stringify({
        username: formData.username,
        email: formData.email,
          password: formData.password,
          
      }),
    });
    if (!res.ok) {
      const errData = await res.json();
      console.error("Error:", errData);
      alert("Registration failed: " + (errData.detail?.[0]?.msg || "Unknown error"));
      return;
    }
    const data = await res.json();
    console.log("Registration successful:", data);
    alert("User registered successfully!");
    navigate("/dashboard");
  } catch (error) {
    console.error("Error:", error);
    alert("Server error. Make sure backend is running.");
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#34A0A4] to-[#52B788] p-4">
      <Card className="w-full max-w-5xl h-[600px] shadow-xl rounded-4xl overflow-hidden bg-white/90 backdrop-blur-lg opacity-90">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 ">
            <MapPin className="h-8 w-8 mt-[20px] text-[#34A0A4]" />
            <h1 className="text-2xl mt-[20px] font-[jersey-10] font-bold text-gray-800">CGanga Data Visualizer</h1>
          </div>
          <p className="text-gray-600  text-[24px] font-[jersey-10] text-sm">Create an account to continue</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                name="username"
                type="text"
                placeholder="Username"
                className="pl-10 text-[20px]"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                name="email"
                type="email"
                placeholder="Email"
                className="pl-10 text-[20px]"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                name="password"
                type="password"
                placeholder="Password"
                className="pl-10 text-[20px]"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-[48px] text-[28px] bg-[#52B788] hover:bg-gray-900  text-white font-semibold"
            >
              Register
            </Button>

            <p className="text-center text-sm text-gray-600 text-[20px]">
              Already have an account?{" "}
              <Link to="/login" className="text-[#1E6091] hover:underline text-[22px]">
                Login here
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

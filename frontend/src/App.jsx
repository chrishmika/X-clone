import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignupPage from "./pages/auth/signup/SignUpPage";
import Sidebar from "./components/common/Sidebar";
import RightPannel from "./components/common/RightPannel";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";

import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";

function App() {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (data.error) return null;

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        console.log("Authenticated user is : ", data);
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex max-w-6xl mx-auto">
      {/*Common component cuz it not wrap with a route */}
      {authUser && <Sidebar />}
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/signup" element={!authUser ? <SignupPage /> : <Navigate to="/" />} />
        <Route path="/notifications" element={authUser ? <NotificationPage /> : <Navigate to="/login" />} />
        <Route path="/profile/:id" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>
      {authUser && <RightPannel />}
      <Toaster />
    </div>
  );
}

export default App;

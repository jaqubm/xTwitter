import { Routes, Route, Navigate } from "react-router-dom";

import LoadingSpinner from "./components/common/LoadingSpinner";

import SideBar from "./components/common/Sidebar"

import HomePage from "./pages/home/HomePage"
import LoginPage from "./pages/auth/login/LoginPage"
import SignUpPage from "./pages/auth/signup/SignUpPage"
import NotificationPage from "./pages/notification/NotificationPage"
import ProfilePage from "./pages/profile/ProfilePage"

import RightPanel from "./components/common/RightPanel"

import { Toaster } from "react-hot-toast"
import { useQuery } from "@tanstack/react-query";

function App() {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("http://localhost:8000/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Something went wrong");

        return data;
      } catch (error) {
        throw new Error(error);
      }
    }
  });

  if (isLoading) {
    return (
      <div className='h-screen flex justify-center items-center'>
        <LoadingSpinner size='lg' />
      </div>
    )
  }

  return (
    <div className='flex max-w-6xl mx-auto'>

      <SideBar />

      <Routes>
        <Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
        <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
        <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
        <Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to='/login' />} />
        <Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
      </Routes>

      <RightPanel />

      <Toaster />

    </div>
  );
}

export default App

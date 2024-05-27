import { Routes, Route } from "react-router-dom";

import SideBar from "./components/common/Sidebar"

import HomePage from "./pages/home/HomePage"
import LoginPage from "./pages/auth/login/LoginPage"
import SignUpPage from "./pages/auth/signup/SignUpPage"
import NotificationPage from "./pages/notification/NotificationPage"
import ProfilePage from "./pages/profile/ProfilePage"

import RightPanel from "./components/common/RightPanel"

import { Toaster } from "react-hot-toast"

function App() {
  return (
    <div className='flex max-w-6xl mx-auto'>

      <SideBar />

      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/signup' element={<SignUpPage />} />
        <Route path='/notifications' element={<NotificationPage />} />
        <Route path='/profile/:username' element={<ProfilePage />} />
      </Routes>

      <RightPanel />

      <Toaster />

    </div>
  );
}

export default App

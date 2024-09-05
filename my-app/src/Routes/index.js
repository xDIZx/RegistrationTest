import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivatRoute from "./PrivatRout";
import useAuth from '../hooks/useAuth.hook';
import RegistrationForm from "../pages/RegistrationForm";
import LoginForm from "../pages/LoginForm";
import AdminPanel from "../pages/AdminPanel";

const AppRoutes = () => {
    const auth = useAuth()

  return (
    
    <Routes>
      <Route
        path="/register"
        element={
            <RegistrationForm />
        }
      />
      <Route
        path="/login"
        element={
            <LoginForm />
        }
      />
      <Route
        path="/admin"
        element={
          <PrivatRoute user={auth}>
            <AdminPanel />
          </PrivatRoute>
        }
      />
    </Routes>
    
  );
};

export default AppRoutes;

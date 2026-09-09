// src/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './LoginPage';
import AdminLogin from './AdminLogin';
import RegistrationPage from './RegistrationPage';
import CustomerHomePage from './CustomerHomePage';
import AdminDashboard from './AdminDashboard';
import CartPage from './CartPage';
import OrdersPage from './OrdersPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Authentication */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/admin" element={<AdminLogin />} />

      {/* Customer Storefront */}
      <Route path="/customerhome" element={<CustomerHomePage />} />
      <Route path="/home" element={<Navigate to="/customerhome" replace />} />

      {/* Orders & Cart */}
      <Route path="/cart" element={<CartPage />} />
      <Route path="/orders" element={<OrdersPage />} />

      {/* Admin Portal */}
      <Route path="/admindashboard" element={<AdminDashboard />} />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
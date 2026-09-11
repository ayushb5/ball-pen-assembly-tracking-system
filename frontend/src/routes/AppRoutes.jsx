import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../layouts/AppLayout';

// Module Pages
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import OrdersPage from '../pages/OrdersPage';
import AssemblyTrackingPage from '../pages/AssemblyTrackingPage';
import WorkstationsPage from '../pages/WorkstationsPage';
import QualityChecksPage from '../pages/QualityChecksPage';
import PackagingPage from '../pages/PackagingPage';
import FinishedGoodsPage from '../pages/FinishedGoodsPage';
import DispatchPage from '../pages/DispatchPage';
import ProductsPage from '../pages/ProductsPage';
import RawMaterialsPage from '../pages/RawMaterialsPage';
import CustomersPage from '../pages/CustomersPage';
import EmployeesPage from '../pages/EmployeesPage';
import ReportsPage from '../pages/ReportsPage';
import NotFoundPage from '../pages/NotFoundPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Manufacturing Execution App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="assembly" element={<AssemblyTrackingPage />} />
        <Route path="workstations" element={<WorkstationsPage />} />
        <Route path="quality" element={<QualityChecksPage />} />
        <Route path="packaging" element={<PackagingPage />} />
        <Route path="finished-goods" element={<FinishedGoodsPage />} />
        <Route path="dispatch" element={<DispatchPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="raw-materials" element={<RawMaterialsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;

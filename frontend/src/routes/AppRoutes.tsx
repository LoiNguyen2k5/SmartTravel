import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { VendorLayout } from '../layouts/VendorLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleBasedRoute } from './RoleBasedRoute';

// Client Pages
import { HomePage } from '../pages/client/HomePage';
import { TourListPage } from '../pages/client/TourListPage';
import { TourDetailPage } from '../pages/client/TourDetailPage';
import { CheckoutPage } from '../pages/client/CheckoutPage';
import { PaymentResultPage } from '../pages/client/PaymentResultPage';
import { BookingHistoryPage } from '../pages/client/BookingHistoryPage';
import { UserProfilePage } from '../pages/client/UserProfilePage';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { UnauthorizedPage } from '../pages/auth/UnauthorizedPage';

// Admin Pages
import { DashboardPage } from '../pages/admin/DashboardPage';
import { TourManagementPage } from '../pages/admin/TourManagementPage';
import { BookingManagementPage } from '../pages/admin/BookingManagementPage';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { TransactionSettlementPage } from '../pages/admin/TransactionSettlementPage';

// Vendor Pages
import { VendorDashboardPage } from '../pages/vendor/VendorDashboardPage';
import { VendorTourListPage } from '../pages/vendor/VendorTourListPage';
import { VendorBookingManagementPage } from '../pages/vendor/VendorBookingManagementPage';
import { VendorProfilePage } from '../pages/vendor/VendorProfilePage';
import { VendorSchedulesPage } from '../pages/vendor/VendorSchedulesPage';
import { CreateTourPage } from '../pages/vendor/CreateTourPage';
import { EditTourPage } from '../pages/vendor/EditTourPage';

import { AboutPage } from '../pages/client/AboutPage';
import { ServicesPage } from '../pages/client/ServicesPage';
import { BlogsPage } from '../pages/client/BlogsPage';
import { ContactPage } from '../pages/client/ContactPage';
import { ScrollToTop } from '../components/common/ScrollToTop';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* === AUTH ROUTES (AuthLayout - centered form) === */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Route>

        {/* === PUBLIC CLIENT ROUTES === */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/tours" element={<TourListPage />} />
          <Route path="/tours/:id" element={<TourDetailPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/payment-result" element={<PaymentResultPage />} />

          {/* Protected: User phải đăng nhập */}
          <Route element={<ProtectedRoute />}>
            <Route path="/planner" element={<Navigate to="/tours" replace />} />
            <Route path="/itinerary" element={<Navigate to="/tours" replace />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/my-bookings" element={<BookingHistoryPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
          </Route>
        </Route>

        {/* === ADMIN ROUTES === */}
        <Route element={<RoleBasedRoute allowedRoles={['ROLE_ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/tours" element={<TourManagementPage />} />
            <Route path="/admin/bookings" element={<BookingManagementPage />} />
            <Route path="/admin/settlements" element={<TransactionSettlementPage />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
          </Route>
        </Route>

        {/* === VENDOR ROUTES === */}
        <Route element={<RoleBasedRoute allowedRoles={['ROLE_VENDOR', 'ROLE_ADMIN']} />}>
          <Route element={<VendorLayout />}>
            <Route path="/vendor" element={<VendorDashboardPage />} />
            <Route path="/vendor/tours" element={<VendorTourListPage />} />
            <Route path="/vendor/schedules" element={<VendorSchedulesPage />} />
            <Route path="/vendor/bookings" element={<VendorBookingManagementPage />} />
            <Route path="/vendor/profile" element={<VendorProfilePage />} />
            <Route path="/vendor/tours/create" element={<CreateTourPage />} />
            <Route path="/vendor/tours/:id/edit" element={<EditTourPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

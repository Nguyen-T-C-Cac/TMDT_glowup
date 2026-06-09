import { Navigate, Route, Routes } from 'react-router-dom'
import CustomerLayout from '../components/layout/CustomerLayout'
import TechnicianLayout from '../components/layout/TechnicianLayout'
import { ChatPage } from '../pages/ChatPage'
import {
  ChangePasswordPage,
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
} from '../pages/AuthScreens'
import { VerifyEmailPage } from '../pages/VerifyEmailPage'
import { PendingEmailVerificationPage } from '../pages/PendingEmailVerificationPage'
import AdminCategoriesPage from '../pages/AdminCategoriesPage'
import AdminDashboard from '../pages/AdminDashboard'
import AdminFinancePage from '../pages/AdminFinancePage'
import AdminSystemSettingsPage from '../pages/AdminSystemSettingsPage'
import AdminUserDetail from '../pages/AdminUserDetail'
import AdminUserManagement from '../pages/AdminUserManagement'
import AdminVerificationDetail from '../pages/AdminVerificationDetail'
import AdminVerificationRequests from '../pages/AdminVerificationRequests'
import AdminVerificationUpdate from '../pages/AdminVerificationUpdate'
import AdminOrdersPage from '../pages/AdminOrdersPage'
import AdminComplaintsPage from '../pages/AdminComplaintsPage'
import AdminComplaintResolvePage from '../pages/AdminComplaintResolvePage'
import CustomerAccountSettingsPage from '../pages/CustomerAccountSettingsPage'
import FindProvider from '../pages/FindProvider'
import HomePage from '../pages/HomePage'
import Provider from '../pages/Provider'
import ProviderDashboard from '../pages/ProviderDashboard'
import ProviderProfile from '../pages/ProviderProfile'
import CustomerSecurityPage from '../pages/CustomerSecurityPage'
import { OrderManagementPage } from '../pages/OrderManagementPage'
import ServicesPage from '../pages/ServicesPage'
import TechnicianProfileSettingsPage from '../pages/TechnicianProfileSettingsPage'
import TechnicianVerificationPage from '../pages/TechnicianVerificationPage'
import TechnicianVerificationStatusPage from '../pages/TechnicianVerificationStatusPage'
import TechnicianWalletPage from '../pages/TechnicianWalletPage'
import TechnicianWalletTopUpPage from '../pages/TechnicianWalletTopUpPage'
import TechnicianWalletTopUpResultPage from '../pages/TechnicianWalletTopUpResultPage'
import TechnicianWalletWithdrawPage from '../pages/TechnicianWalletWithdrawPage'
import VoucherRewardsPage from '../pages/VoucherRewardsPage'


export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/provider" element={<Provider />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/rewards" element={<VoucherRewardsPage />} />
      <Route path="/provider-profile" element={<CustomerLayout activeNavKey="find-provider"><ProviderProfile /></CustomerLayout>} />
      <Route path="/provider-dashboard" element={<ProviderDashboard />} />
      <Route path="/find-provider" element={<CustomerLayout activeNavKey="find-provider"><FindProvider /></CustomerLayout>} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/change-password" element={<ChangePasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/pending-email-verification" element={<PendingEmailVerificationPage />} />
      <Route path="/reset-password" element={<ChangePasswordPage />} />

      <Route path="/technician">
        <Route path="jobs" element={<TechnicianLayout activeItem="jobs"><OrderManagementPage role="technician" /></TechnicianLayout>} />
        <Route path="wallet" element={<TechnicianLayout activeItem="wallet"><TechnicianWalletPage /></TechnicianLayout>} />
        <Route path="wallet/topup" element={<TechnicianLayout activeItem="wallet"><TechnicianWalletTopUpPage /></TechnicianLayout>} />
        <Route path="wallet/topup-result" element={<TechnicianLayout activeItem="wallet"><TechnicianWalletTopUpResultPage /></TechnicianLayout>} />
        <Route path="wallet/withdraw" element={<TechnicianLayout activeItem="wallet"><TechnicianWalletWithdrawPage /></TechnicianLayout>} />
        <Route path="profile" element={<TechnicianLayout activeItem="profile"><TechnicianProfileSettingsPage /></TechnicianLayout>} />
        <Route path="verification" element={<TechnicianVerificationPage />} />
        <Route path="verification-status" element={<TechnicianVerificationStatusPage />} />
        <Route path="provider-dashboard" element={<TechnicianLayout activeItem="dashboard"><ProviderDashboard /></TechnicianLayout>} />
        <Route path="chat" element={<TechnicianLayout activeItem="chat"><ChatPage role="technician" /></TechnicianLayout>} />
      </Route>

      <Route path="/customer">
        <Route path="settings" element={<Navigate to="/customer/account-settings" replace />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="order-management" element={<CustomerLayout activeNavKey="account" activeSidebarItem="wallet" searchPlaceholder="Tìm kiếm dịch vụ..."><OrderManagementPage role="customer" /></CustomerLayout>} />
        <Route path="change-password" element={<CustomerLayout activeNavKey="account" activeSidebarItem="security" searchPlaceholder="Tìm kiếm dịch vụ..."><CustomerSecurityPage /></CustomerLayout>} />
        <Route path="account-settings" element={<CustomerLayout activeNavKey="account" activeSidebarItem="personal" searchPlaceholder="Tìm kiếm dịch vụ..."><CustomerAccountSettingsPage /></CustomerLayout>} />
      </Route>

      <Route path="/admin">
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="users" element={<AdminUserManagement />} />
        <Route path="users/:id" element={<AdminUserDetail />} />
        <Route path="finance" element={<AdminFinancePage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="verification" element={<AdminVerificationRequests />} />
        <Route path="verification/:requestId" element={<AdminVerificationDetail />} />
        <Route path="verification/:requestId/update" element={<AdminVerificationUpdate />} />
        <Route path="settings" element={<AdminSystemSettingsPage />} />
        <Route path="complaints" element={<AdminComplaintsPage />} />
        <Route path="complaints/:complaintId/resolve" element={<AdminComplaintResolvePage />} />
      </Route>

      <Route path="/auth">
        <Route index element={<Navigate to="login" replace />} />
      </Route>
    </Routes>
  )
}

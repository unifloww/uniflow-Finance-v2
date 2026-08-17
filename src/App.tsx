/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Login } from "./pages/Login";
import { PhoneLogin } from "./pages/PhoneLogin";
import { Register } from "./pages/Register";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { UserLayout } from "./components/UserLayout";
import { AdminLayout } from "./components/AdminLayout";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminUsers } from "./pages/AdminUsers";
import { AdminPricing } from "./pages/AdminPricing";
import { AdminRevenue } from "./pages/AdminRevenue";
import { Dashboard } from "./pages/Dashboard";
import { Transactions } from "./pages/Transactions";
import { Accounts } from "./pages/Accounts";
import { Goals } from "./pages/Goals";
import { Analytics } from "./pages/Analytics";
import { Profile } from "./pages/Profile";
import { ThemeToggle } from "./components/ThemeToggle";

import { LandingPage } from "./pages/LandingPage";
import { InstallPrompt } from "./components/InstallPrompt";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
            <InstallPrompt />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/phone-login" element={<PhoneLogin />} />
              <Route path="/register" element={<Register />} />

              {/* User Routes */}
              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={["superadmin"]} />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/pricing" element={<AdminPricing />} />
                  <Route path="/admin/revenue" element={<AdminRevenue />} />
                </Route>
              </Route>

              <Route
                element={
                  <ProtectedRoute allowedRoles={["user", "superadmin"]} />
                }
              >
                <Route element={<UserLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/dashboard/accounts" element={<Accounts />} />
                  <Route
                    path="/dashboard/transactions"
                    element={<Transactions />}
                  />
                  <Route path="/dashboard/goals" element={<Goals />} />
                  <Route path="/dashboard/analytics" element={<Analytics />} />
                  <Route path="/dashboard/profile" element={<Profile />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

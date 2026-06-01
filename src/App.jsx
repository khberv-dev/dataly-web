import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ToasterComponent, ToasterProvider } from '@gravity-ui/uikit'
import queryClient from '@/services/queryClient'
import toaster from '@/services/toaster'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { AuthProvider } from '@/providers/AuthProvider'
import { RequireAuth } from '@/ui/components/RequireAuth'
import { AppLayout } from '@/ui/components/AppLayout'
import { LoginPage } from '@/ui/pages/auth/LoginPage'
import { RegisterPage } from '@/ui/pages/auth/RegisterPage'
import { DashboardPage } from '@/ui/pages/dashboard/DashboardPage'
import { KeysPage } from '@/ui/pages/keys/KeysPage'
import { AccountsPage } from '@/ui/pages/accounts/AccountsPage'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToasterProvider toaster={toaster}>
          <ToasterComponent />
          <BrowserRouter>
            <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                element={
                  <RequireAuth>
                    <AppLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="accounts" element={<AccountsPage />} />
                <Route path="keys" element={<KeysPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </AuthProvider>
          </BrowserRouter>
        </ToasterProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

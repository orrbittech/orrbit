import { Outlet, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/app-shell'
import { AuthAwareFallback, GuestRoute, ProtectedRoute } from '@/components/route-guards'
import { HomePage } from '@/pages/home'
import { LandingPage } from '@/pages/landing'
import { SettingsPage } from '@/pages/settings'
import { SignInPage } from '@/pages/sign-in'
import { SignUpPage } from '@/pages/sign-up'
import { SSOCallbackPage } from '@/pages/sso-callback'
import { HOME_PATH, NAV_ROUTES, SSO_CALLBACK_PATH } from '@/lib/nav-routes'

const PAGE_BY_PATH = {
  [HOME_PATH]: <HomePage />,
  '/settings': <SettingsPage />
} as const

export default function App() {
  return (
    <Routes>
      <Route path={SSO_CALLBACK_PATH} element={<SSOCallbackPage />} />
      <Route element={<GuestRoute />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <AppShell>
              <Outlet />
            </AppShell>
          }
        >
          {NAV_ROUTES.map((route) => (
            <Route key={route.path} path={route.path} element={PAGE_BY_PATH[route.path]} />
          ))}
        </Route>
      </Route>
      <Route path="*" element={<AuthAwareFallback />} />
    </Routes>
  )
}

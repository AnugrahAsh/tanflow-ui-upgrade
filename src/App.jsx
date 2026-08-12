import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'
import { TooltipProvider } from './components/charts/Tooltip.jsx'
import AppShell from './components/shell/AppShell.jsx'
import StubView from './views/StubView.jsx'
import CreateUser from './views/CreateUser.jsx'
import CreateConnectionGroup from './views/CreateConnectionGroup.jsx'
import RoleDetail from './views/RoleDetail.jsx'
import CreateConnection from './views/CreateConnection.jsx'
import ReportDetail from './views/ReportDetail.jsx'
import Login from './views/Login.jsx'
import Login1 from './views/Login1.jsx'
import Login2 from './views/Login2.jsx'
import Login3 from './views/Login3.jsx'
import Login4 from './views/Login4.jsx'
import Login5 from './views/Login5.jsx'
import Login6 from './views/Login6.jsx'
import Login7 from './views/Login7.jsx'
import Login8 from './views/Login8.jsx'
import Login9 from './views/Login9.jsx'
import SessionConsole from './views/SessionConsole.jsx'
// Pre-auth, recovery and MFA enrolment (render outside the app shell).
import ForgotPassword from './views/ForgotPassword.jsx'
import ResetPassword from './views/ResetPassword.jsx'
import MfaVerify from './views/MfaVerify.jsx'
import MfaSetup from './views/MfaSetup.jsx'
import MfaTotpSetup from './views/MfaTotpSetup.jsx'
import MfaSmsSetup from './views/MfaSmsSetup.jsx'
import MfaEmailSetup from './views/MfaEmailSetup.jsx'
import MfaWebauthnSetup from './views/MfaWebauthnSetup.jsx'
import MfaBackupCodes from './views/MfaBackupCodes.jsx'
import LogoutNotice from './views/LogoutNotice.jsx'
import SharePublic from './views/SharePublic.jsx'
import GuestTunnel from './views/GuestTunnel.jsx'
import { NotFound, Unauthorized, ServiceUnavailable, Maintenance } from './views/StatusPages.jsx'
import { VIEWS } from './views/index.js'
import { ALL_IDS, DEFAULT_ROUTE } from './router/nav.js'

export default function App() {
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppProvider>
        <TooltipProvider>
          <Routes>
            <Route path="login" element={<Login />} />
            <Route path="login1" element={<Login1 />} />
            <Route path="login2" element={<Login2 />} />
            <Route path="login3" element={<Login3 />} />
            <Route path="login4" element={<Login4 />} />
            <Route path="login5" element={<Login5 />} />
            <Route path="login6" element={<Login6 />} />
            <Route path="login7" element={<Login7 />} />
            <Route path="login8" element={<Login8 />} />
            <Route path="login9" element={<Login9 />} />
            <Route path="session/:target" element={<SessionConsole />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="mfa-verify" element={<MfaVerify />} />
            <Route path="mfa-setup" element={<MfaSetup />} />
            <Route path="mfa-totp" element={<MfaTotpSetup />} />
            <Route path="mfa-sms" element={<MfaSmsSetup />} />
            <Route path="mfa-email" element={<MfaEmailSetup />} />
            <Route path="mfa-webauthn" element={<MfaWebauthnSetup />} />
            <Route path="mfa-backup-codes" element={<MfaBackupCodes />} />
            <Route path="logged-out" element={<LogoutNotice />} />
            <Route path="share" element={<SharePublic />} />
            <Route path="guest-session" element={<GuestTunnel />} />
            <Route path="not-found" element={<NotFound />} />
            <Route path="unauthorized" element={<Unauthorized />} />
            <Route path="service-unavailable" element={<ServiceUnavailable />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="/" element={<AppShell />}>
              <Route index element={<Navigate to={`/${DEFAULT_ROUTE}`} replace />} />
              {ALL_IDS.map((id) => {
                const View = VIEWS[id]
                return <Route key={id} path={id} element={View ? <View /> : <StubView id={id} />} />
              })}
              <Route path="edit-user/:id" element={<CreateUser />} />
              <Route path="edit-connection-group/:id" element={<CreateConnectionGroup />} />
              <Route path="role/:id" element={<RoleDetail />} />
              <Route path="create-connection/:protocol" element={<CreateConnection />} />
              <Route path="report/:id" element={<ReportDetail />} />
              {/* Unknown in-app path renders the 404 rather than silently redirecting. */}
              <Route path="*" element={<NotFound embedded />} />
            </Route>
          </Routes>
        </TooltipProvider>
      </AppProvider>
    </HashRouter>
  )
}

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
import Login1 from './views/Login1.jsx'
import Login2 from './views/Login2.jsx'
import Login3 from './views/Login3.jsx'
import Login4 from './views/Login4.jsx'
import Login5 from './views/Login5.jsx'
import SessionConsole from './views/SessionConsole.jsx'
import { VIEWS } from './views/index.js'
import { ALL_IDS, DEFAULT_ROUTE } from './router/nav.js'

export default function App() {
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppProvider>
        <TooltipProvider>
          <Routes>
            <Route path="login1" element={<Login1 />} />
            <Route path="login2" element={<Login2 />} />
            <Route path="login3" element={<Login3 />} />
            <Route path="login4" element={<Login4 />} />
            <Route path="login5" element={<Login5 />} />
            <Route path="session/:target" element={<SessionConsole />} />
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
              <Route path="*" element={<Navigate to={`/${DEFAULT_ROUTE}`} replace />} />
            </Route>
          </Routes>
        </TooltipProvider>
      </AppProvider>
    </HashRouter>
  )
}

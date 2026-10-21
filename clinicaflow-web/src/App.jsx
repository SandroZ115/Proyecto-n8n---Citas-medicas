import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'
import { ConfirmProvider } from './components/ui/ConfirmDialog'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Layout from './components/Layout'
import RutaProtegida from './components/RutaProtegida'
import RutaRol from './components/RutaRol'
import NuevaCita from './pages/NuevaCita'
import Agenda from './pages/Agenda'
import AprobarCita from './pages/AprobarCita'
import CrearUsuario from './pages/CrearUsuario'
import DesbloquearUsuario from './pages/DesbloquearUsuario'
import Especialidades from './pages/Especialidades'
import Usuarios from './pages/Usuarios'
import Reportes from './pages/Reportes'

export default function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <RutaProtegida>
                  <Layout />
                </RutaProtegida>
              }
            >
              <Route index element={<Dashboard />} />
              <Route
                path="nueva"
                element={
                  <RutaRol permiso="nueva">
                    <NuevaCita />
                  </RutaRol>
                }
              />
              <Route
                path="agenda"
                element={
                  <RutaRol permiso="nueva">
                    <Agenda />
                  </RutaRol>
                }
              />
              <Route
                path="aprobar"
                element={
                  <RutaRol permiso="aprobar">
                    <AprobarCita />
                  </RutaRol>
                }
              />
              <Route
                path="crear-usuario"
                element={
                  <RutaRol permiso="crear-usuario">
                    <CrearUsuario />
                  </RutaRol>
                }
              />
              <Route
                path="desbloquear"
                element={
                  <RutaRol permiso="desbloquear">
                    <DesbloquearUsuario />
                  </RutaRol>
                }
              />
              <Route
                path="especialidades"
                element={
                  <RutaRol permiso="crear-usuario">
                    <Especialidades />
                  </RutaRol>
                }
              />
              <Route
                path="usuarios"
                element={
                  <RutaRol permiso="usuarios">
                    <Usuarios />
                  </RutaRol>
                }
              />
              <Route
                path="reportes"
                element={
                  <RutaRol permiso="reportes">
                    <Reportes />
                  </RutaRol>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </ConfirmProvider>
    </ToastProvider>
  )
}

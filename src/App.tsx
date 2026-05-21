import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import GestionConductores from "./presentation/pages/GestionConductores";
import RegistrarConductor from "./presentation/pages/RegistrarConductor";
import Login from "./presentation/pages/Login";
import ForgotPassword from "./presentation/pages/ForgotPassword";
import ResetPassword from "./presentation/pages/ResetPassword";
import AuthGuard from "./presentation/Components/AuthGuard.tsx";
import { ROUTES } from "./presentation/routes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.login} element={<Login />} />
        <Route path="/login" element={<Navigate to={ROUTES.login} replace />} />

        <Route element={<AuthGuard />}>
          <Route path={ROUTES.conductores} element={<GestionConductores />} />
          <Route
            path={ROUTES.registrarConductor}
            element={<RegistrarConductor />}
          />
        </Route>

        <Route
          path={ROUTES.recuperarContrasena}
          element={<ForgotPassword />}
        />
        <Route
          path={ROUTES.restablecerContrasena}
          element={<ResetPassword />}
        />
        {/* Rutas antiguas en inglés → redirección */}
        <Route
          path="/forgot-password"
          element={<Navigate to={ROUTES.recuperarContrasena} replace />}
        />
        <Route
          path="/reset-password"
          element={<Navigate to={ROUTES.restablecerContrasena} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

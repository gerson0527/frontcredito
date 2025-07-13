// pagelogin.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../contexts/AuthContext";
import { LoginForm } from "./components/login-form"
import { Quotes } from "./components/quotes"
import "./login.css" // Importar estilos específicos

export default function PageLogin() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si el usuario ya está autenticado, redirigir al dashboard
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si ya está autenticado, no mostrar el login
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="login-page" data-theme="light">
      <div className="login-container flex h-screen w-full bg-white">
        <div className="w-1/2 flex items-center justify-center p-10 bg-white">
          <LoginForm />
        </div>
        <div className="login-quote-section w-1/2 flex items-center justify-center p-10">
          <Quotes />
        </div>
      </div>
    </div>
  )
}
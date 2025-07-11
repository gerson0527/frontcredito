// pagelogin.tsx
import { LoginForm } from "./components/login-form"
import { Quotes } from "./components/quotes"
import "./login.css" // Importar estilos específicos

export default function PageLogin() {
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
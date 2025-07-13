import PageLogin from "../features/auth/login/pagelogin";

export function meta() {
  return [
    { title: "Iniciar Sesión - CreditPro" },
    { name: "description", content: "Accede a tu cuenta de CreditPro para gestionar créditos y clientes" },
  ];
}

export default function RouteLoginPage() {
  return (
    <PageLogin />
  )
}
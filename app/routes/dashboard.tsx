import Dashboard from "@/features/dashboard/dashboard";
import { ProtectedRoute } from "@/features/auth/login/ProtectedRoute";

export function meta() {
  return [
    { title: "Dashboard - CreditPro" },
    { name: "description", content: "Panel de control principal de CreditPro" },
  ];
}

export default function RouteDashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
}
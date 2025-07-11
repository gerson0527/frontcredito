// src/components/LoginForm.tsx
import { useNavigate } from "react-router";
import { useToast } from "@/hooks/use-toast"
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { AuthService } from "../../../../services/auth.service";
import { Progress } from "../../../../components/ui/progress";
import { useUser } from "@/contexts/UserContext"; // 🎯 IMPORTAR CONTEXTO

export function LoginForm() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser } = useUser(); // 🎯 USAR CONTEXTO

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setProgress(0);

    // 🧪 PRUEBA: Mostrar toast inmediatamente para verificar que funciona
    toast({
      title: "Iniciando sesión...",
      description: "Verificando credenciales",
      variant: "default",
    });

    // Simular progreso
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 100);

    try {
      console.log("🔄 Iniciando login...");
      const response = await AuthService.login(credentials);
      console.log("📡 Respuesta del servidor:", response);
      
      if (response.success) {
        setProgress(100);
        
        // 🎯 GUARDAR USUARIO EN CONTEXTO
        setUser(response.user);
        
        console.log("✅ Login exitoso, mostrando toast...");
        toast({
          title: "Inicio de sesión exitoso",
          description: `Bienvenido, ${response.user.username}!`,
          variant: "default",
        });

        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      } else {

        toast({
          title: "Error de autenticación",
          description: response.message || "Credenciales incorrectas. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      clearInterval(progressInterval);
      setProgress(0);
    }
  };

  return (
    <Card className="login-card w-full max-w-md mx-auto bg-white border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="login-title text-2xl text-center text-gray-800">Iniciar Sesión</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username" className="login-label text-gray-700">Usuario</Label>
            <Input
              id="username"
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
              className="login-input bg-white border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <Label htmlFor="password" className="login-label text-gray-700">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
              className="login-input bg-white border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          {isLoading && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="login-progress-text text-sm text-center text-gray-600">
                Verificando credenciales...
              </p>
            </div>
          )}
          <Button type="submit" className="login-button w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
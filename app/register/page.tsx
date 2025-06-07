"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

const ROLES = [
  { id: 1, label: "Administrador" },
  { id: 2, label: "Recepcionista" },
  { id: 3, label: "Especialista" },
];

export default function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rolID, setRolID] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [especialidad, setEspecialidad] = useState("");
  const [licencia, setLicencia] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handler para volver al dashboard según el rol
  const handleVolverDashboard = () => {
    const userCookie = Cookies.get("user");
    if (!userCookie) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userCookie);
    const rol = user.Rol?.rol;

    if (rol === "Administrador") {
      router.push("/dashboard/admin");
    } else if (rol === "Especialista") {
      router.push("/dashboard/especialistaDash");
    } else if (rol === "Recepcionista") {
      router.push("/dashboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!nombre || !apellido || !email || !password) {
        throw new Error("Por favor complete todos los campos");
      }
      if (rolID === 3 && (!especialidad || !licencia)) {
        throw new Error(
          "Especialidad y licencia son requeridas para especialistas"
        );
      }

      // 1. Crear empleado
      const empleadoRes = await axios.post(
        "https://localhost:7032/api/Empleado",
        {
          rolID,
          nombre,
          apellido,
          email,
          contrasena: password,
          activo: true,
          fechaRegistro: new Date().toISOString(),
        }
      );

      // 2. Si es especialista, crear especialista
      if (rolID === 3) {
        await axios.post("https://localhost:7032/api/Especialista", {
          empleadoID: empleadoRes.data.empleadoID,
          especialidad,
          licencia,
        });
      }

      router.push("/login");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError("Error al registrar usuario");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error desconocido");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-2xl font-bold text-gray-900"
          >
            <Heart className="h-8 w-8 text-teal-600" />
            <span>AutismoCare</span>
          </Link>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Registrar nuevo Usuario
            </CardTitle>
            <CardDescription className="text-center">
              Complete los datos para crear una cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rol">Rol</Label>
                <select
                  id="rol"
                  className="w-full border rounded-md px-2 py-2"
                  value={rolID}
                  onChange={(e) => setRolID(Number(e.target.value))}
                >
                  {ROLES.map((rol) => (
                    <option key={rol.id} value={rol.id}>
                      {rol.label}
                    </option>
                  ))}
                </select>
              </div>
              {rolID === 3 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="especialidad">Especialidad</Label>
                    <Input
                      id="especialidad"
                      value={especialidad}
                      onChange={(e) => setEspecialidad(e.target.value)}
                      required={rolID === 3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licencia">Licencia</Label>
                    <Input
                      id="licencia"
                      value={licencia}
                      onChange={(e) => setLicencia(e.target.value)}
                      required={rolID === 3}
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={loading}
              >
                {loading ? "Registrando..." : "Registrar"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <Link href="/login" className="text-teal-600 hover:underline">
                ¿Ya tienes cuenta? Inicia sesión
              </Link>
            </div>
            <Button
              type="button"
              className="w-40 mt-4 bg-teal-600  hover:bg-teal-700"
              onClick={handleVolverDashboard}
            >
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

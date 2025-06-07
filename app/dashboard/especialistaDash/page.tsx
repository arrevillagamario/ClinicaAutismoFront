"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  ClipboardList,
  FileText,
  Calendar,
  Heart,
  LogOut,
  Settings,
} from "lucide-react";
import Cookies from "js-cookie";

interface User {
  EmpleadoID: number;
  Email: string;
  Nombre: string;
  Apellido: string;
  Rol: {
    RolId: number;
    rol: string;
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (!userCookie) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(userCookie) as User;
      setUser(userData);
    } catch (error) {
      console.error("Error parsing user cookie:", error);
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    Cookies.remove("user");
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  const stats = [
    {
      title: "Pacientes Registrados",
      value: "127",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Evaluaciones Pendientes",
      value: "8",
      icon: ClipboardList,
      color: "text-orange-600",
    },
    {
      title: "Evaluaciones Realizadas",
      value: "45",
      icon: FileText,
      color: "text-green-600",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      patient: "Ana García",
      action: "Evaluación CARS-2 completada",
      time: "Hace 2 horas",
      status: "completed",
    },
    {
      id: 2,
      patient: "Carlos López",
      action: "Nuevo paciente registrado",
      time: "Hace 4 horas",
      status: "new",
    },
    {
      id: 3,
      patient: "María Rodríguez",
      action: "Diagnóstico pendiente",
      time: "Hace 1 día",
      status: "pending",
    },
    {
      id: 4,
      patient: "Luis Martín",
      action: "Cita agendada",
      time: "Hace 2 días",
      status: "scheduled",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-teal-600" />
                <span className="text-xl font-bold text-gray-900">
                  AutismoCare
                </span>
              </Link>
              <Badge variant="secondary">{user.Rol.rol}</Badge>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bienvenido, {user.Nombre} {user.Apellido}
              </span>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
          <p className="text-gray-600 mt-2">
            Gestiona pacientes, evaluaciones y diagnósticos
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>Tareas más comunes del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  asChild
                  className="h-20 flex-col space-y-2 bg-teal-600 hover:bg-teal-700"
                >
                  <Link href="/dashboard/diagnosticoP">
                    <UserPlus className="h-6 w-6" />
                    <span>Evaluciones Pendientes</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                >
                  <Link href="/dashboard/diagnosticoR">
                    <ClipboardList className="h-6 w-6" />
                    <span>Evaluaciones Realizadas</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                >
                  <Link href="/dashboard/patients">
                    <Users className="h-6 w-6" />
                    <span>Ver Pacientes</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Heart,
  Search,
  UserPlus,
  Users,
  Pencil,
} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 1. Asegúrate de que 'contrasena' esté en el modelo y en el estado
interface EmpleadoDto {
  empleadoID: number;
  nombre: string;
  apellido: string;
  email: string;
  rolID: number;
  activo: boolean;
  fechaRegistro: string;
  contrasena?: string;
}

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState<EmpleadoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardUrl, setDashboardUrl] = useState("/dashboard");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmpleadoDto | null>(
    null
  );
  const [editForm, setEditForm] = useState<EmpleadoDto | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("https://localhost:7032/api/Empleado");
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setError("Error al cargar los empleados");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      const user = JSON.parse(userCookie);
      const rol = user.Rol?.rol || user.Rol || "";
      if (rol === "Administrador") setDashboardUrl("/dashboard/admin");
      else if (rol === "Especialista")
        setDashboardUrl("/dashboard/especialistaDash");
      else if (rol === "Recepcionista") setDashboardUrl("/dashboard");
    }
  }, []);

  // Ordena los empleados por fechaRegistro descendente (más reciente primero)
  const employeesSorted = [...employees].sort((a, b) => {
    if (!a.fechaRegistro) return 1;
    if (!b.fechaRegistro) return -1;
    return (
      new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime()
    );
  });

  const filteredEmployees = employeesSorted.filter(
    (emp) =>
      emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.rolID.toString().includes(searchTerm.toLowerCase())
  );

  // Función para mostrar el nombre del rol según el rolID
  const getRolNombre = (rolID: number) => {
    switch (rolID) {
      case 1:
        return "Administrador";
      case 2:
        return "Recepcionista";
      case 3:
        return "Especialista";
      default:
        return "Desconocido";
    }
  };

  // Abrir modal y precargar datos
  const handleEditClick = (emp: EmpleadoDto) => {
    setSelectedEmployee(emp);
    setEditForm({
      ...emp,
      nombre: emp.nombre ?? "",
      apellido: emp.apellido ?? "",
      email: emp.email ?? "",
      contrasena: emp.contrasena ?? "",
      fechaRegistro: emp.fechaRegistro ?? new Date().toISOString(),
    });
    setEditModalOpen(true);
  };

  // Guardar cambios
  const handleSave = async () => {
    if (!editForm) return;
    setSaving(true);
    try {
      // Imprime el payload para depuración
      console.log("Payload enviado:", {
        rolID: editForm.rolID,
        nombre: editForm.nombre,
        apellido: editForm.apellido,
        email: editForm.email,
        contrasena: editForm.contrasena ?? "",
        activo: editForm.activo,
        fechaRegistro: editForm.fechaRegistro,
      });

      await axios.put(
        `https://localhost:7032/api/Empleado/${editForm.empleadoID}`,
        {
          rolID: editForm.rolID,
          nombre: editForm.nombre,
          apellido: editForm.apellido,
          email: editForm.email,
          contrasena: editForm.contrasena ?? "",
          activo: editForm.activo,
          fechaRegistro: editForm.fechaRegistro,
        }
      );
      setEmployees((prev) =>
        prev.map((e) => (e.empleadoID === editForm.empleadoID ? editForm : e))
      );
      setEditModalOpen(false);
    } catch (err) {
      alert("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Cargando empleados...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href={dashboardUrl} className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-teal-600" />
                <span className="text-xl font-bold text-gray-900">
                  AutismoCare
                </span>
              </Link>
            </div>
            <Button variant="ghost" asChild>
              <Link href={dashboardUrl} className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Volver al Dashboard</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Empleados
            </h1>
            <p className="text-gray-600 mt-2">
              Lista completa de empleados registrados
            </p>
          </div>
          <Button asChild className="bg-teal-600 hover:bg-teal-700">
            <Link
              href="/register"
              className="flex items-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Nuevo Empleado</span>
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Buscar Empleados</CardTitle>
            <CardDescription>
              Filtre por nombre, apellido, email o rol
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, apellido, email o rol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Employees Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Empleados</CardTitle>
            <CardDescription>
              {filteredEmployees.length} empleado
              {filteredEmployees.length !== 1 ? "s" : ""} encontrado
              {filteredEmployees.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Registro</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((emp) => (
                  <TableRow key={emp.empleadoID}>
                    <TableCell className="font-medium">
                      {emp.nombre} {emp.apellido}
                    </TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{getRolNombre(emp.rolID)}</TableCell>
                    <TableCell>
                      {emp.activo ? (
                        <Badge className="bg-green-100 text-green-800">
                          Activo
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          Inactivo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {emp.fechaRegistro
                        ? new Date(emp.fechaRegistro).toLocaleDateString("es-ES")
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center space-x-1"
                        onClick={() => handleEditClick(emp)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modal de edición */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Empleado</DialogTitle>
          </DialogHeader>
          {editForm && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <Input
                  value={editForm.nombre ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Apellido</label>
                <Input
                  value={editForm.apellido}
                  onChange={(e) =>
                    setEditForm({ ...editForm, apellido: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rol</label>
                <Select
                  value={editForm.rolID.toString()}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, rolID: Number(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Administrador</SelectItem>
                    <SelectItem value="2">Recepcionista</SelectItem>
                    <SelectItem value="3">Especialista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <Select
                  value={editForm.activo ? "activo" : "inactivo"}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, activo: value === "activo" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contraseña</label>
                <Input
                  type="password"
                  value={editForm.contrasena ?? ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, contrasena: e.target.value })
                  }
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

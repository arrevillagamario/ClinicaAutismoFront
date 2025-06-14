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
  Eye,
  Calendar,
  FileText,
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

interface PacienteEstadoEvaluacionDto {
  sesionID: number;
  pacienteID: number;
  nombre: string;
  apellido: string;
  genero: string | null;
  fechaNacimiento: string;
  fechaRegistro: string | null;
  tutorID: number;
  tutorNombre: string;
  tutorApellido: string;
  estadoSesion: string | null;
}

interface PacienteEditDto {
  pacienteID: number;
  tutorID: number;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  genero: string;
}

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<PacienteEstadoEvaluacionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardUrl, setDashboardUrl] = useState("/dashboard");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<PacienteEditDto | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(
          "https://localhost:7032/api/paciente/pacientes-sesion"
        );
        setPatients(response.data);
      } catch (error) {
        console.error("Error fetching patients:", error);
        setError("Error al cargar los pacientes");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
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

  // Ordena los pacientes por fechaRegistro descendente (más reciente primero)
  const patientsSorted = [...patients].sort((a, b) => {
    if (!a.fechaRegistro) return 1;
    if (!b.fechaRegistro) return -1;
    return (
      new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime()
    );
  });

  const filteredPatients = patientsSorted.filter(
    (patient) =>
      patient.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.tutorNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.tutorApellido.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAge = (fechaNacimiento: string) => {
    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }

    if (years < 1) {
      return `${months} mes${months !== 1 ? "es" : ""}`;
    }
    return `${years} año${years !== 1 ? "s" : ""} ${months} mes${
      months !== 1 ? "es" : ""
    }`;
  };

  const getStatusBadge = (estado: string | null) => {
    if (!estado) return <Badge variant="outline">Sin Evaluar</Badge>;

    switch (estado.toLowerCase()) {
      case "evaluado":
        return <Badge variant="secondary">Evaluado</Badge>;
      case "pendiente":
        return (
          <Badge className="bg-orange-100 text-orange-800">Pendiente</Badge>
        );
      case "completado":
        return (
          <Badge className="bg-green-100 text-green-800">Completado</Badge>
        );
      case "diagnosticado":
        return (
          <Badge className="bg-blue-100 text-blue-800">Diagnosticado</Badge>
        );
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const getRiskBadge = (estado: string | null) => {
    if (!estado) return null;

    switch (estado.toLowerCase()) {
      case "alto":
        return <Badge className="bg-red-100 text-red-800">Alto</Badge>;
      case "moderado":
        return (
          <Badge className="bg-orange-100 text-orange-800">Moderado</Badge>
        );
      case "bajo":
        return <Badge className="bg-green-100 text-green-800">Bajo</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  // Abrir modal y precargar datos del paciente
  const handleEditClick = (patient: PacienteEstadoEvaluacionDto) => {
    setEditForm({
      pacienteID: patient.pacienteID,
      tutorID: patient.tutorID,
      nombre: patient.nombre ?? "",
      apellido: patient.apellido ?? "",
      fechaNacimiento: patient.fechaNacimiento?.substring(0, 10) ?? "",
      genero: patient.genero ?? "",
    });
    setEditModalOpen(true);
  };

  // Guardar cambios
  const handleSave = async () => {
    if (!editForm) return;
    setSaving(true);
    try {
      await axios.put(
        `https://localhost:7032/api/Paciente/${editForm.pacienteID}`,
        {
          pacienteID: editForm.pacienteID,
          tutorID: editForm.tutorID,
          nombre: editForm.nombre,
          apellido: editForm.apellido,
          fechaNacimiento: editForm.fechaNacimiento,
          genero: editForm.genero,
        }
      );
      // Actualiza la lista localmente
      setPatients((prev) =>
        prev.map((p) =>
          p.pacienteID === editForm.pacienteID
            ? { ...p, ...editForm }
            : p
        )
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
        <div>Cargando pacientes...</div>
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
              Gestión de Pacientes
            </h1>
            <p className="text-gray-600 mt-2">
              Lista completa de pacientes registrados
            </p>
          </div>
          <Button asChild className="bg-teal-600 hover:bg-teal-700">
            <Link
              href="/dashboard/patients/new"
              className="flex items-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Nuevo Paciente</span>
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Pacientes
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {patients.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <UserPlus className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pendientes
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {
                      patients.filter(
                        (p) => p.estadoSesion?.toLowerCase() === "pendiente"
                      ).length
                    }
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Completados
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {
                      patients.filter(
                        (p) => p.estadoSesion?.toLowerCase() === "completado"
                      ).length
                    }
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Buscar Pacientes</CardTitle>
            <CardDescription>
              Filtre por nombre del paciente o tutor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre del paciente o tutor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Pacientes</CardTitle>
            <CardDescription>
              {filteredPatients.length} paciente
              {filteredPatients.length !== 1 ? "s" : ""} encontrado
              {filteredPatients.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Género</TableHead>
                  <TableHead>Fecha Registro</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.pacienteID}>
                    <TableCell className="font-medium">
                      {patient.nombre} {patient.apellido}
                    </TableCell>
                    <TableCell>
                      {calculateAge(patient.fechaNacimiento)}
                    </TableCell>
                    <TableCell>
                      {patient.tutorNombre} {patient.tutorApellido}
                    </TableCell>
                    <TableCell>
                      {patient.genero === "M"
                        ? "Masculino"
                        : patient.genero === "F"
                        ? "Femenino"
                        : "No especificado"}
                    </TableCell>
                    <TableCell>
                      {patient.fechaRegistro
                        ? new Date(patient.fechaRegistro).toLocaleDateString(
                            "es-ES"
                          )
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(patient.estadoSesion)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {patient.estadoSesion == "pendiente" && (
                          <Button
                            size="sm"
                            className="bg-teal-600 hover:bg-teal-700"
                            asChild
                          >
                            <Link
                              href={`/dashboard/evaluations/new?pacienteId=${patient.pacienteID}`}
                            >
                              Evaluar
                            </Link>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(patient)}
                        >
                          Editar
                        </Button>
                      </div>
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
            <DialogTitle>Editar Paciente</DialogTitle>
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
                  value={editForm.nombre}
                  onChange={(e) =>
                    setEditForm({ ...editForm, nombre: e.target.value })
                  }
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
                <label className="block text-sm font-medium mb-1">
                  Fecha de Nacimiento
                </label>
                <Input
                  type="date"
                  value={editForm.fechaNacimiento}
                  onChange={(e) =>
                    setEditForm({ ...editForm, fechaNacimiento: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Género</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={editForm.genero}
                  onChange={(e) =>
                    setEditForm({ ...editForm, genero: e.target.value })
                  }
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
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

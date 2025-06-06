"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Heart, Save } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

export default function NewPatientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Estados para el tutor
  const [tutorData, setTutorData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    parentesco: "",
  });

  // Estados para el paciente
  const [patientData, setPatientData] = useState({
    nombre: "",
    apellido: "",
    fechaNacimiento: "",
    genero: "",
    observaciones: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Verificar autenticación
      const userCookie = Cookies.get("user");
      if (!userCookie) {
        router.push("/login");
        return;
      }

      // 2. Crear primero el tutor
      const tutorResponse = await axios.post(
        "https://localhost:7032/api/tutor",
        {
          nombre: tutorData.nombre,
          apellido: tutorData.apellido,
          telefono: tutorData.telefono,
          email: tutorData.email || null, // Envía null si está vacío
          parentesco: tutorData.parentesco,
        }
      );

      if (!tutorResponse.data?.tutorID) {
        throw new Error("No se pudo obtener el ID del tutor creado");
      }

      const tutorId = tutorResponse.data.tutorID;

      // 3. Crear el paciente con el tutorID
      await axios.post("https://localhost:7032/api/paciente", {
        tutorID: tutorId,
        nombre: patientData.nombre,
        apellido: patientData.apellido,
        fechaNacimiento: patientData.fechaNacimiento,
        genero: patientData.genero || null, // Envía null si está vacío
        observaciones: patientData.observaciones || null, // Envía null si está vacío
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/patients");
      }, 2000);
    } catch (error) {
      console.error("Error al registrar paciente:", error);
      setError(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al registrar paciente"
          : "Ocurrió un error inesperado"
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Save className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¡Paciente Registrado!
            </h3>
            <p className="text-gray-600">
              El paciente y tutor han sido registrados exitosamente.
            </p>
          </CardContent>
        </Card>
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
              <Link href="/dashboard" className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-teal-600" />
                <span className="text-xl font-bold text-gray-900">
                  AutismoCare
                </span>
              </Link>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/dashboard" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Volver al Dashboard</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Registrar Nuevo Paciente
          </h1>
          <p className="text-gray-600 mt-2">
            Complete la información del tutor-evaluado y del paciente
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información del Tutor */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Tutor - Evaluado</CardTitle>
              <CardDescription>
                Datos de la persona responsable del menor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tutor-nombre">Nombre *</Label>
                  <Input
                    id="tutor-nombre"
                    value={tutorData.nombre}
                    onChange={(e) =>
                      setTutorData({ ...tutorData, nombre: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tutor-apellido">Apellido *</Label>
                  <Input
                    id="tutor-apellido"
                    value={tutorData.apellido}
                    onChange={(e) =>
                      setTutorData({ ...tutorData, apellido: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tutor-telefono">Teléfono *</Label>
                  <Input
                    id="tutor-telefono"
                    type="tel"
                    value={tutorData.telefono}
                    onChange={(e) =>
                      setTutorData({ ...tutorData, telefono: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tutor-email">Email</Label>
                  <Input
                    id="tutor-email"
                    type="email"
                    value={tutorData.email}
                    onChange={(e) =>
                      setTutorData({ ...tutorData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentesco">Parentesco *</Label>
                <Select
                  value={tutorData.parentesco}
                  onValueChange={(value) =>
                    setTutorData({ ...tutorData, parentesco: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el parentesco" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="padre">Padre</SelectItem>
                    <SelectItem value="madre">Madre</SelectItem>
                    <SelectItem value="tutor-legal">Tutor Legal</SelectItem>
                    <SelectItem value="abuelo">Abuelo/a</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Información del Paciente */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Paciente</CardTitle>
              <CardDescription>
                Datos del menor que será evaluado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="paciente-nombre">Nombre *</Label>
                  <Input
                    id="paciente-nombre"
                    value={patientData.nombre}
                    onChange={(e) =>
                      setPatientData({ ...patientData, nombre: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paciente-apellido">Apellido *</Label>
                  <Input
                    id="paciente-apellido"
                    value={patientData.apellido}
                    onChange={(e) =>
                      setPatientData({
                        ...patientData,
                        apellido: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fecha-nacimiento">
                    Fecha de Nacimiento *
                  </Label>
                  <Input
                    id="fecha-nacimiento"
                    type="date"
                    value={patientData.fechaNacimiento}
                    onChange={(e) =>
                      setPatientData({
                        ...patientData,
                        fechaNacimiento: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genero">Género</Label>
                  <Select
                    value={patientData.genero}
                    onValueChange={(value) =>
                      setPatientData({ ...patientData, genero: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Información adicional relevante..."
                  value={patientData.observaciones}
                  onChange={(e) =>
                    setPatientData({
                      ...patientData,
                      observaciones: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard">Cancelar</Link>
            </Button>
            <Button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Registrar Paciente"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

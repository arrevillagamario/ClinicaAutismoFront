// app/dashboard/diagnosticoP/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import axios from "axios";

// Tipo que representa un paciente pendiente de diagnóstico, con datos de la tabla Resultados:
interface PendingPaciente {
  id: number; // ID del paciente
  nombre: string;
  apellido: string;
  edad: string;
  tutor: string;
  telefono: string;
  ultimaEvaluacion: string | null;
  resultadoId: number; // ID en la tabla Resultados
  riesgoAutismo: string; // RiesgoAutismo de Resultados
  observaciones: string; // Observaciones de Resultados
}

export default function DiagnosticoPPage() {
  const [pacientes, setPacientes] = useState<PendingPaciente[]>([]);
  const [inputs, setInputs] = useState<{
    [resultadoId: number]: { conclusion: string; detalles: string };
  }>({});
  const [search, setSearch] = useState("");
  const especialistaId = 1;

  useEffect(() => {
    const fetchPendientes = async () => {
      try {
        // 1. Traer todos los pacientes con sesión
        const res = await axios.get(
          "https://localhost:7032/api/Paciente/pacientes-sesion"
        );
        const data = res.data;

        // 2. Filtrar solo los que tienen estadoSesion "completado"
        const completados = data.filter(
          (p: any) => p.estadoSesion === "completado"
        );

        // 3. Para cada paciente, traer resultado y teléfono del tutor
        const pacientesData: PendingPaciente[] = (
          await Promise.all(
            completados.map(async (p: any) => {
              // Traer resultados del paciente
              const resultadoRes = await axios.get(
                `https://localhost:7032/api/Resultado/por-paciente/${p.pacienteID}`
              );
              // Tomar el resultado que coincida con la sesión actual
              const resultado = resultadoRes.data.find(
                (r: any) => r.sessionID === p.sessionID
              );

              if (!resultado) return null; // <-- Solo agrega si hay resultado

              // Traer teléfono del tutor (si lo necesitas)
              let telefono = "";
              try {
                const tutorRes = await axios.get(
                  `https://localhost:7032/api/Tutor/${p.tutorID}`
                );
                telefono = tutorRes.data.telefono || "";
              } catch {
                telefono = "";
              }

              return {
                id: p.pacienteID,
                nombre: p.nombre,
                apellido: p.apellido,
                edad: calcularEdad(p.fechaNacimiento),
                tutor: p.tutorNombre + " " + p.tutorApellido,
                telefono,
                ultimaEvaluacion: p.fechaRegistro,
                resultadoId: resultado.resultadoID, // <-- Nunca será 0
                riesgoAutismo: resultado.riesgoAutismo || "",
                observaciones: resultado.observaciones || "",
              };
            })
          )
        ).filter(Boolean); // <-- Elimina los null

        setPacientes(pacientesData);
      } catch (err) {
        console.error("Error al cargar pacientes pendientes:", err);
      }
    };

    fetchPendientes();
  }, []);

  // Función para calcular edad desde fecha de nacimiento
  function calcularEdad(fechaNacimiento: string) {
    if (!fechaNacimiento) return "N/A";
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let años = hoy.getFullYear() - nacimiento.getFullYear();
    let meses = hoy.getMonth() - nacimiento.getMonth();
    if (meses < 0) {
      años--;
      meses += 12;
    }
    return `${años} año${años !== 1 ? "s" : ""} ${meses} mes${
      meses !== 1 ? "es" : ""
    }`;
  }

  const handleInputChange = (
    resultadoId: number,
    field: "conclusion" | "detalles",
    value: string
  ) => {
    setInputs((prev) => ({
      ...prev,
      [resultadoId]: {
        ...prev[resultadoId],
        [field]: value,
      },
    }));
  };

  const handleSave = async (row: PendingPaciente) => {
    const entry = inputs[row.resultadoId];
    if (!entry || !entry.conclusion.trim() || !entry.detalles.trim()) {
      alert("Debe completar tanto la conclusión como los detalles.");
      return;
    }

    if (!row.resultadoId || !especialistaId) {
      alert("Faltan datos requeridos para el diagnóstico.");
      return;
    }

    try {
      const payload = {
        resultadoID: row.resultadoId,
        especialistaID: especialistaId,
        conclusion: entry.conclusion.trim(),
        detalles: entry.detalles.trim(),
        fechaDiagnostico: new Date().toISOString(),
      };
      await axios.post("https://localhost:7032/api/Diagnostico", payload);

      // PATCH para cambiar el estado de la sesión a "realizado"
      // Debes tener el sessionId (puedes guardarlo en tu PendingPaciente)
      // Supongamos que lo tienes como row.sessionId
      await axios.patch(
        `https://localhost:7032/api/Evaluaciones/${row.id}/estado`,
        {
          sesionID: row.id,
          estado: "realizado",
        }
      );

      setPacientes((prev) =>
        prev.filter((p) => p.resultadoId !== row.resultadoId)
      );
      setInputs((prev) => {
        const copy = { ...prev };
        delete copy[row.resultadoId];
        return copy;
      });

      alert("Diagnóstico guardado correctamente.");
    } catch (err: any) {
      alert("Error al guardar el diagnóstico.");
      console.error(err?.response?.data || err);
    }
  };

  // Ordenar pacientes por ultimaEvaluacion descendente (más reciente primero)
  const pacientesOrdenados = [...pacientes].sort((a, b) => {
    if (!a.ultimaEvaluacion) return 1;
    if (!b.ultimaEvaluacion) return -1;
    return (
      new Date(b.ultimaEvaluacion).getTime() -
      new Date(a.ultimaEvaluacion).getTime()
    );
  });

  // Filtrado de pacientes según búsqueda
  const pacientesFiltrados = pacientesOrdenados.filter((p) => {
    const texto = `${p.nombre} ${p.apellido} ${p.tutor}`.toLowerCase();
    return texto.includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="especialistaDash"
              className="flex items-center space-x-2 text-gray-900"
            >
              <ArrowLeft className="h-6 w-6 text-gray-700" />
              <span className="text-xl font-bold">Diagnósticos Pendientes</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                className="pl-10"
                placeholder="Buscar por nombre del paciente o tutor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pacientes Sin Diagnóstico</CardTitle>
            <CardDescription>
              {pacientes.length} paciente
              {pacientes.length !== 1 ? "s" : ""} pendiente
              {pacientes.length !== 1 ? "n" : ""} de diagnóstico
            </CardDescription>
          </CardHeader>

          <CardContent>
            {pacientesFiltrados.length === 0 ? (
              <p className="text-gray-600">No hay pacientes pendientes.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Edad</TableHead>
                    <TableHead>Tutor</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Última Evaluación</TableHead>
                    <TableHead>Riesgo Autismo</TableHead>
                    <TableHead>Observaciones</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {pacientesFiltrados.map((row) => (
                    <TableRow key={row.resultadoId}>
                      <TableCell className="font-medium">
                        {row.nombre} {row.apellido}
                      </TableCell>
                      <TableCell>{row.edad}</TableCell>
                      <TableCell>{row.tutor}</TableCell>
                      <TableCell>{row.telefono}</TableCell>
                      <TableCell>
                        {row.ultimaEvaluacion
                          ? new Date(row.ultimaEvaluacion).toLocaleDateString(
                              "es-ES"
                            )
                          : "N/A"}
                      </TableCell>
                      <TableCell>{row.riesgoAutismo}</TableCell>
                      <TableCell>
                        <div className="max-h-16 overflow-y-auto text-sm text-gray-700">
                          {row.observaciones}
                        </div>
                      </TableCell>

                      <TableCell>
                        {/* Botón que abre el modal */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="bg-teal-600 hover:bg-teal-700"
                            >
                              Diagnosticar
                            </Button>
                          </DialogTrigger>

                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>
                                Diagnóstico para {row.nombre} {row.apellido}
                              </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 py-2">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Conclusión
                                </label>
                                <Input
                                  placeholder="Ingrese conclusión..."
                                  value={
                                    inputs[row.resultadoId]?.conclusion || ""
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      row.resultadoId,
                                      "conclusion",
                                      e.target.value
                                    )
                                  }
                                  className="w-full mt-1"
                                  maxLength={100}
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Detalles
                                </label>
                                <textarea
                                  placeholder="Ingrese detalles..."
                                  className="w-full border rounded-md px-2 py-1 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-teal-400 mt-1"
                                  value={
                                    inputs[row.resultadoId]?.detalles || ""
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      row.resultadoId,
                                      "detalles",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancelar</Button>
                              </DialogClose>
                              <Button
                                onClick={() => handleSave(row)}
                                className="bg-teal-600 hover:bg-teal-700"
                              >
                                Guardar
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

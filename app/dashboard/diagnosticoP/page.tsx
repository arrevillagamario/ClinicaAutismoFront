// app/dashboard/diagnosticoP/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ArrowLeft, Eye } from "lucide-react";

// Tipo que representa un paciente pendiente de diagnóstico, con datos de la tabla Resultados:
interface PendingPaciente {
  id: number;                    // ID del paciente
  nombre: string;
  apellido: string;
  edad: string;
  tutor: string;
  telefono: string;
  ultimaEvaluacion: string | null;
  resultadoId: number;           // ID en la tabla Resultados
  riesgoAutismo: string;         // RiesgoAutismo de Resultados
  observaciones: string;         // Observaciones de Resultados
}

// Ejemplo de paciente para mostrar en pantalla:
const ejemploPaciente: PendingPaciente = {
  id: 2,
  nombre: "Carlos",
  apellido: "Martín Ruiz",
  edad: "1 año 8 meses",
  tutor: "Juan Martín",
  telefono: "+34 666 789 012",
  ultimaEvaluacion: "2024-01-10",
  resultadoId: 5,
  riesgoAutismo: "Alto",
  observaciones:
    "Se detectaron comportamientos repetitivos y baja interacción social durante la última evaluación.",
};

export default function DiagnosticoPPage() {
  // Estado inicial con el paciente de ejemplo
  const [pacientes, setPacientes] = useState<PendingPaciente[]>([
    ejemploPaciente,
  ]);

  // Para almacenar los inputs de "Conclusión" y "Detalles" por cada resultadoId
  const [inputs, setInputs] = useState<{
    [resultadoId: number]: { conclusion: string; detalles: string };
  }>({});

  // ID ficticio del especialista (en producción, lo obtendrías del contexto de sesión)
  const especialistaId = 1;

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

  const handleSave = (row: PendingPaciente) => {
    const entry = inputs[row.resultadoId];
    if (!entry || !entry.conclusion.trim() || !entry.detalles.trim()) {
      alert("Debe completar tanto la conclusión como los detalles.");
      return;
    }

    // Simulación de envío al API
    const payload = {
      resultadoId: row.resultadoId,
      especialistaId,
      conclusion: entry.conclusion.trim(),
      detalles: entry.detalles.trim(),
    };
    console.log("Payload a enviar al API:", payload);

    // Una vez “guardado”, removemos ese paciente de la lista
    setPacientes((prev) =>
      prev.filter((p) => p.resultadoId !== row.resultadoId)
    );
    // Limpiamos inputs correspondientes
    setInputs((prev) => {
      const copy = { ...prev };
      delete copy[row.resultadoId];
      return copy;
    });

    alert("Diagnóstico guardado correctamente (simulado).");
  };

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
            <CardTitle>Pacientes Sin Diagnóstico</CardTitle>
            <CardDescription>
              {pacientes.length} paciente
              {pacientes.length !== 1 ? "s" : ""} pendiente
              {pacientes.length !== 1 ? "n" : ""} de diagnóstico
            </CardDescription>
          </CardHeader>

          <CardContent>
            {pacientes.length === 0 ? (
              <p className="text-gray-600">
                No hay pacientes pendientes de diagnóstico.
              </p>
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
                  {pacientes.map((row) => (
                    <TableRow key={row.resultadoId}>
                      <TableCell className="font-medium">
                        {row.nombre} {row.apellido}
                      </TableCell>
                      <TableCell>{row.edad}</TableCell>
                      <TableCell>{row.tutor}</TableCell>
                      <TableCell>{row.telefono}</TableCell>
                      <TableCell>
                        {row.ultimaEvaluacion
                          ? new Date(
                              row.ultimaEvaluacion
                            ).toLocaleDateString("es-ES")
                          : "Sin evaluar"}
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
                            <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
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
                                  value={inputs[row.resultadoId]?.conclusion || ""}
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
                                  value={inputs[row.resultadoId]?.detalles || ""}
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

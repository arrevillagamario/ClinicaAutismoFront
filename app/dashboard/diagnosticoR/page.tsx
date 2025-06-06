// app/dashboard/diagnosticoR/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye } from "lucide-react";

// Tipo que representa un paciente ya diagnosticado, con datos de la tabla Resultados y Diagnosticos:
interface DiagnosedPaciente {
  id: number;                    // ID del paciente
  nombre: string;
  apellido: string;
  edad: string;
  tutor: string;
  telefono: string;
  ultimaEvaluacion: string | null;
  riesgoAutismo: string;         // RiesgoAutismo de Resultados
  observaciones: string;         // Observaciones de Resultados
  conclusion: string;            // Conclusión del especialista
  detalles: string;              // Detalles del diagnóstico
  fechaDiagnostico: string;      // Fecha en que se guardó el diagnóstico
}

// Ejemplo de paciente ya diagnosticado para mostrar en pantalla:
const ejemploDiagnosticado: DiagnosedPaciente = {
  id: 2,
  nombre: "Carlos",
  apellido: "Martín Ruiz",
  edad: "1 año 8 meses",
  tutor: "Juan Martín",
  telefono: "+34 666 789 012",
  ultimaEvaluacion: "2024-01-10",
  riesgoAutismo: "Alto",
  observaciones:
    "Se detectaron comportamientos repetitivos y baja interacción social durante la última evaluación.",
  conclusion: "Trastorno del Espectro Autista leve",
  detalles:
    "El paciente muestra signos consistentes con TEA leve: dificultades en contacto visual y patrones de conducta repetitiva moderados.",
  fechaDiagnostico: "2024-02-05",
};

export default function DiagnosticoRPage() {
  // Estado inicial con el paciente de ejemplo
  const [pacientes, setPacientes] = useState<DiagnosedPaciente[]>([
    ejemploDiagnosticado,
  ]);

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
        <Card>
          <CardHeader>
            <CardTitle>Listado de Pacientes con Diagnóstico</CardTitle>
            <CardDescription>
              {pacientes.length} paciente{pacientes.length !== 1 ? "s" : ""} encontrado
              {pacientes.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {pacientes.length === 0 ? (
              <p className="text-gray-600">No hay pacientes diagnosticados aún.</p>
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
                    <TableHead>Conclusión</TableHead>
                    <TableHead>Detalles</TableHead>
                    <TableHead>Fecha Diagnóstico</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {pacientes.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">
                        {row.nombre} {row.apellido}
                      </TableCell>
                      <TableCell>{row.edad}</TableCell>
                      <TableCell>{row.tutor}</TableCell>
                      <TableCell>{row.telefono}</TableCell>
                      <TableCell>
                        {row.ultimaEvaluacion
                          ? new Date(row.ultimaEvaluacion).toLocaleDateString("es-ES")
                          : "Sin evaluar"}
                      </TableCell>
                      <TableCell>{row.riesgoAutismo}</TableCell>
                      <TableCell>
                        <div className="max-h-16 overflow-y-auto text-sm text-gray-700">
                          {row.observaciones}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-800">{row.conclusion}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-h-16 overflow-y-auto text-sm text-gray-700">
                          {row.detalles}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(row.fechaDiagnostico).toLocaleDateString("es-ES")}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/patients/${row.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
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

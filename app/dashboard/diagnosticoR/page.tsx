// app/dashboard/diagnosticoR/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
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
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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
  return `${años} año${años !== 1 ? "s" : ""} ${meses} mes${meses !== 1 ? "es" : ""}`;
}

export default function DiagnosticoRPage() {
  // Estado inicial con el paciente de ejemplo
  const [pacientes, setPacientes] = useState<DiagnosedPaciente[]>([
    ejemploDiagnosticado,
  ]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [historial, setHistorial] = useState<any[]>([]);
  const [historialPaciente, setHistorialPaciente] = useState<string>("");

  useEffect(() => {
    const fetchRealizados = async () => {
      try {
        // 1. Traer pacientes con estadoSesion "realizado"
        const res = await axios.get("https://localhost:7032/api/Paciente/pacientes-sesion");
        const data = res.data;
        const realizados = data.filter((p: any) => p.estadoSesion === "realizado");

        // 2. Traer todos los diagnósticos
        const diagRes = await axios.get("https://localhost:7032/api/Diagnostico");
        const diagnosticos = diagRes.data;

        // 3. Para cada paciente, buscar su resultado y diagnóstico
        const pacientesData = await Promise.all(
          realizados.map(async (p: any) => {
            // Traer resultado
            const resultadoRes = await axios.get(
              `https://localhost:7032/api/Resultado/por-paciente/${p.pacienteID}`
            );
            const resultado = resultadoRes.data.find((r: any) => r.sessionID === p.sessionID);
            if (!resultado) return null;

            // Buscar diagnóstico por resultadoID
            const diagnostico = diagnosticos.find(
              (d: any) => d.resultadoID === resultado.resultadoID
            );
            if (!diagnostico) return null;

            // Traer teléfono del tutor
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
              riesgoAutismo: resultado.riesgoAutismo || "",
              observaciones: resultado.observaciones || "",
              conclusion: diagnostico.conclusion || "",
              detalles: diagnostico.detalles || "",
              fechaDiagnostico: diagnostico.fechaDiagnostico || "",
            };
          })
        );

        setPacientes(pacientesData.filter(Boolean));
      } catch (err) {
        console.error("Error al cargar pacientes realizados:", err);
      }
    };

    fetchRealizados();
  }, []);

  // Filtrado de pacientes según búsqueda
  const pacientesFiltrados = pacientes.filter((p) => {
    const texto = `${p.nombre} ${p.apellido} ${p.tutor}`.toLowerCase();
    return texto.includes(search.toLowerCase());
  });

  // Cambiar estado a pendiente usando PATCH en Evaluaciones
  const handleNuevoTest = async (pacienteId: number) => {
    try {
      // Traer la sesión actual del paciente
      const sesionesRes = await axios.get(`https://localhost:7032/api/Sesion/por-paciente/${pacienteId}`);
      const sesiones = sesionesRes.data;
      // Busca la sesión en estado "realizado"
      const sesionRealizada = sesiones.find((s: any) => s.estadoSesion === "realizado");
      if (!sesionRealizada) {
        alert("No se encontró una sesión realizada para este paciente.");
        return;
      }
      await axios.patch(
        `https://localhost:7032/api/Evaluaciones/${sesionRealizada.sesionID}/estado`,
        {
          sesionID: sesionRealizada.sesionID,
          estado: "pendiente",
        }
      );
      window.location.reload();
    } catch (err) {
      alert("Error al cambiar el estado");
    }
  };

  // Abrir modal de historial
  const handleVerHistorial = async (pacienteId: number, nombre: string, apellido: string) => {
    try {
      const res = await axios.get(`https://localhost:7032/api/Resultado/por-paciente/${pacienteId}`);
      setHistorial(res.data || []);
      setHistorialPaciente(`${nombre} ${apellido}`);
      setModalOpen(true);
    } catch {
      setHistorial([]);
      setModalOpen(true);
    }
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
        {/* Buscador */}
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

        <Card>
          <CardHeader>
            <CardTitle>Listado de Pacientes con Diagnóstico</CardTitle>
            <CardDescription>
              {pacientesFiltrados.length} paciente{pacientesFiltrados.length !== 1 ? "s" : ""} encontrado
              {pacientesFiltrados.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pacientesFiltrados.length === 0 ? (
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
                  {pacientesFiltrados.map((row) => (
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
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleNuevoTest(row.id)}
                          >
                            Se necesita nuevo test
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleVerHistorial(row.id, row.nombre, row.apellido)}
                          >
                            Historial
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de historial */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
            <h2 className="text-lg font-bold mb-4">Historial de evaluaciones de {historialPaciente}</h2>
            {historial.length === 0 ? (
              <p>No hay evaluaciones previas.</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {historial.map((h, idx) => (
                  <li key={idx} className="border-b pb-2">
                    <div><b>Fecha:</b> {h.fecha ? new Date(h.fecha).toLocaleDateString("es-ES") : "N/A"}</div>
                    <div><b>Riesgo:</b> {h.riesgoAutismo}</div>
                    <div><b>Observaciones:</b> {h.observaciones}</div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setModalOpen(false)}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

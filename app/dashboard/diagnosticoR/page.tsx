// app/dashboard/diagnosticoR/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
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
  id: number; // ID del paciente
  nombre: string;
  apellido: string;
  edad: string;
  tutor: string;
  telefono: string;
  ultimaEvaluacion: string | null;
  riesgoAutismo: string; // RiesgoAutismo de Resultados
  observaciones: string; // Observaciones de Resultados
  conclusion: string; // Conclusión del especialista
  detalles: string; // Detalles del diagnóstico
  fechaDiagnostico: string; // Fecha en que se guardó el diagnóstico
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
  return `${años} año${años !== 1 ? "s" : ""} ${meses} mes${
    meses !== 1 ? "es" : ""
  }`;
}

export default function DiagnosticoRPage() {
  const router = useRouter();

  // Estado inicial con el paciente de ejemplo
  const [pacientes, setPacientes] = useState<DiagnosedPaciente[]>([
    ejemploDiagnosticado,
  ]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [historial, setHistorial] = useState<any[]>([]);
  const [historialPaciente, setHistorialPaciente] = useState<string>("");
  const [detallePaciente, setDetallePaciente] =
    useState<DiagnosedPaciente | null>(null);

  useEffect(() => {
    const fetchRealizados = async () => {
      try {
        // 1. Traer pacientes con estadoSesion "realizado"
        const res = await axios.get(
          "https://localhost:7032/api/Paciente/pacientes-sesion"
        );
        const data = res.data;
        const realizados = data.filter(
          (p: any) => p.estadoSesion === "realizado"
        );

        // 2. Traer todos los diagnósticos
        const diagRes = await axios.get(
          "https://localhost:7032/api/Diagnostico"
        );
        const diagnosticos = diagRes.data;

        // 3. Para cada paciente, buscar su resultado y diagnóstico
        const pacientesData = await Promise.all(
          realizados.map(async (p: any) => {
            // Traer resultado
            const resultadoRes = await axios.get(
              `https://localhost:7032/api/Resultado/por-paciente/${p.pacienteID}`
            );
            const resultado = resultadoRes.data.find(
              (r: any) => r.sessionID === p.sessionID
            );
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
              sesionID: p.sesionID, // <-- AGREGA ESTA LÍNEA
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
              especialista: diagnostico.especialistaNombre || "Desconocido",
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
  const handleNuevoTest = async (sesionID: number) => {
    try {
      await axios.patch(
        `https://localhost:7032/api/Evaluaciones/${sesionID}/estado`,
        {
          sesionID,
          estado: "pendiente",
        }
      );
      // Opcional: recarga la lista o muestra un mensaje
      window.location.reload();
    } catch (err) {
      alert("Error al cambiar el estado");
    }
  };

  // Abrir modal de historial
  const handleVerHistorial = async (
    pacienteId: number,
    nombre: string,
    apellido: string
  ) => {
    try {
      const res = await axios.get(
        `https://localhost:7032/api/Resultado/por-paciente/${pacienteId}`
      );
      setHistorial(res.data || []);
      setHistorialPaciente(`${nombre} ${apellido}`);
      setModalOpen(true);
    } catch {
      setHistorial([]);
      setModalOpen(true);
    }
  };

  // Abrir modal de detalle
  const handleVerDetalle = (paciente: DiagnosedPaciente) => {
    setDetallePaciente(paciente);
    setDetalleOpen(true);
  };

  const handleVolverDashboard = () => {
    const userCookie = Cookies.get("user");
    if (!userCookie) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userCookie);
    const rol = user.Rol?.rol;

    if (rol === "Administrador") {
      router.push("/dashboard");
    } else if (rol === "Especialista") {
      router.push("/dashboard/especialistaDash");
    } else if (rol === "Recepcionista") {
      router.push("/dashboard/recepcionistaDash");
    } else {
      router.push("/dashboard");
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
              <span className="text-xl font-bold">Diagnósticos Realizados</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Buscador */}

        <Card className="shadow-xl border border-gray-200">
          <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl text-black">
                  Listado de Pacientes con Diagnóstico
                </CardTitle>
                <CardDescription className="text-teal-600">
                  {pacientesFiltrados.length} paciente
                  {pacientesFiltrados.length !== 1 ? "s" : ""} encontrado
                  {pacientesFiltrados.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10 border-gray-300 focus:ring-teal-400"
                  placeholder="Buscar por nombre del paciente o tutor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="bg-gray-100 border-b border-gray-200">
                  <TableHead className="text-black font-semibold">
                    Paciente
                  </TableHead>
                  <TableHead className="text-black font-semibold">
                    Edad
                  </TableHead>
                  <TableHead className="text-black font-semibold">
                    Tutor
                  </TableHead>
                  <TableHead className="text-black font-semibold">
                    Teléfono
                  </TableHead>
                  <TableHead className="text-black font-semibold">
                    Última Evaluación
                  </TableHead>
                  <TableHead className="text-black font-semibold">
                    Riesgo Autismo
                  </TableHead>
                  <TableHead className="text-black font-semibold">
                    Fecha Diagnóstico
                  </TableHead>
                  <TableHead className="text-black font-semibold text-center">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pacientesFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-teal-600 py-8"
                    >
                      No hay pacientes diagnosticados aún.
                    </TableCell>
                  </TableRow>
                ) : (
                  pacientesFiltrados.map((row, idx) => (
                    <TableRow
                      key={row.id}
                      className={
                        idx % 2 === 0
                          ? "bg-white border-b border-gray-100"
                          : "bg-gray-50 border-b border-gray-100"
                      }
                    >
                      <TableCell>
                        <button
                          className="text-black underline font-semibold"
                          onClick={() => {
                            setDetallePaciente(row);
                            setDetalleOpen(true);
                          }}
                          title="Ver detalles del paciente"
                        >
                          {row.nombre} {row.apellido}
                        </button>
                      </TableCell>
                      <TableCell className="text-black">{row.edad}</TableCell>
                      <TableCell className="text-black">{row.tutor}</TableCell>
                      <TableCell>
                        <span className="inline-block bg-teal-100 text-teal-700 rounded px-2 py-1 text-xs font-medium">
                          {row.telefono}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            row.riesgoAutismo.toLowerCase() === "alto"
                              ? "bg-red-100 text-red-700"
                              : row.riesgoAutismo.toLowerCase() === "moderado"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {row.riesgoAutismo}
                        </span>
                      </TableCell>
                      <TableCell className="text-black">
                        {new Date(row.fechaDiagnostico).toLocaleDateString(
                          "es-ES"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2 min-w-[160px]">
                          <Button
                            size="sm"
                            className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1 rounded shadow"
                            onClick={() => handleNuevoTest(row.sesionID)}
                          >
                            <span>Se necesita nuevo test</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-teal-600 text-teal-700 hover:bg-teal-50 flex items-center gap-1 rounded shadow"
                            onClick={() =>
                              handleVerHistorial(
                                row.id,
                                row.nombre,
                                row.apellido
                              )
                            }
                          >
                            <span>Historial</span>
                          </Button>
                          <Button
                            size="sm"
                            className="bg-gray-200 hover:bg-gray-300 text-black flex items-center gap-1 rounded shadow"
                            onClick={() => handleVerDetalle(row)}
                          >
                            <span>Detalles</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modal de historial */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
            <h2 className="text-lg font-bold mb-4 text-black">
              Historial de evaluaciones de {historialPaciente}
            </h2>
            {historial.length === 0 ? (
              <p className="text-black">No hay evaluaciones previas.</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {historial.map((h, idx) => (
                  <li key={idx} className="border-b pb-2 text-black">
                    <div>
                      <b>Fecha:</b>{" "}
                      {h.fecha
                        ? new Date(h.fecha).toLocaleDateString("es-ES")
                        : "N/A"}
                    </div>
                    <div>
                      <b>Riesgo:</b> {h.riesgoAutismo}
                    </div>
                    <div>
                      <b>Observaciones:</b> {h.observaciones}
                    </div>
                    <div>
                      <b>Conclusión:</b> {h.conclusion}
                    </div>
                    <div>
                      <b>Detalles:</b> {h.detalles}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="text-black"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalle */}
      {detalleOpen && detallePaciente && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full border-2 border-teal-600">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-black">
                Detalles de {detallePaciente.nombre} {detallePaciente.apellido}
              </h2>
              <button
                className="text-black hover:text-teal-900 text-xl font-bold"
                onClick={() => setDetalleOpen(false)}
                title="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="space-y-2 text-black text-sm">
              <div>
                <b>Edad:</b> {detallePaciente.edad}
              </div>
              <div>
                <b>Tutor:</b> {detallePaciente.tutor}
              </div>
              <div>
                <b>Teléfono:</b> {detallePaciente.telefono}
              </div>

              <div>
                <b>Riesgo Autismo:</b>{" "}
                <span
                  className={`font-bold ${
                    detallePaciente.riesgoAutismo.toLowerCase() === "alto"
                      ? "text-red-700"
                      : detallePaciente.riesgoAutismo.toLowerCase() ===
                        "moderado"
                      ? "text-yellow-700"
                      : "text-green-700"
                  }`}
                >
                  {detallePaciente.riesgoAutismo}
                </span>
              </div>
              <div>
                <b>Observaciones:</b>{" "}
                <span className="whitespace-pre-line">
                  {detallePaciente.observaciones}
                </span>
              </div>
              <div>
                <b>Conclusión:</b> {detallePaciente.conclusion}
              </div>
              <div>
                <b>Detalles:</b>{" "}
                <span className="whitespace-pre-line">
                  {detallePaciente.detalles}
                </span>
              </div>
              <div>
                <b>Especialista:</b> {detallePaciente.especialista}
              </div>
              <div>
                <b>Fecha Diagnóstico:</b>{" "}
                {new Date(detallePaciente.fechaDiagnostico).toLocaleDateString(
                  "es-ES"
                )}
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => setDetalleOpen(false)}
                className="border-teal-600 text-black hover:bg-teal-50"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

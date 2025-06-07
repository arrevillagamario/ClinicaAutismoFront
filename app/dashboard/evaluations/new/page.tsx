// app/dashboard/NewEvaluationPage.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Heart, ArrowRight, CheckCircle } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

// Preguntas de evaluación
const mchatQuestions = [
  {
    id: 1,
    question:
      "¿Cómo se relaciona el niño con otras personas (niños o adultos)?",
  },
  {
    id: 2,
    question:
      "¿Imita el niño los gestos, sonidos o acciones de otras personas?",
  },
  {
    id: 3,
    question:
      "¿Cómo expresa el niño sus emociones (alegría, tristeza, enojo, etc.)?",
  },
  {
    id: 4,
    question:
      "¿Cómo usa el niño su cuerpo? ¿Muestra movimientos repetitivos o inusuales?",
  },
  {
    id: 5,
    question:
      "¿Cómo interactúa el niño con objetos o juguetes? ¿Los usa de forma funcional?",
  },
  {
    id: 6,
    question: "¿Cómo reacciona el niño ante cambios en su rutina o entorno?",
  },
  {
    id: 7,
    question:
      "¿Cómo responde el niño a estímulos visuales (miradas, luces, movimientos)?",
  },
  {
    id: 8,
    question:
      "¿Cómo reacciona el niño a sonidos o voces? ¿Parece escuchar normalmente?",
  },
  {
    id: 9,
    question:
      "¿Cómo responde a estímulos del tacto, olfato o gusto? ¿Tiene reacciones exageradas o poco comunes?",
  },
  {
    id: 10,
    question:
      "¿El niño muestra miedo o ansiedad? ¿Reacciona de forma inusual ante situaciones peligrosas o nuevas?",
  },
  {
    id: 11,
    question:
      "¿Cómo se comunica verbalmente el niño? ¿Habla con claridad o usa palabras apropiadas para su edad?",
  },
  {
    id: 12,
    question:
      "¿Cómo utiliza el lenguaje no verbal (gestos, expresiones faciales, posturas)?",
  },
  {
    id: 13,
    question:
      "¿Cuál es el nivel de actividad del niño? ¿Es muy inquieto o demasiado pasivo?",
  },
  {
    id: 14,
    question:
      "¿Cómo es el rendimiento intelectual del niño comparado con otros de su edad?",
  },
  {
    id: 15,
    question:
      "En general, ¿cuán evidentes son los signos de autismo en el comportamiento del niño?",
  },
];

export default function NewEvaluationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pacienteId = searchParams.get("pacienteId");

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showResultsSummary, setShowResultsSummary] = useState(false);
  const [showObservationsForm, setShowObservationsForm] = useState(false);
  const [resultPartial, setResultPartial] = useState<{
    totalScore: number;
    avg: number;
    riskLevel: string;
  } | null>(null);
  const [manualObservations, setManualObservations] = useState("");
  const [saved, setSaved] = useState(false);

  const [patientData, setPatientData] = useState<{
    nombre: string;
    apellido: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    } else {
      router.push("/dashboard");
    }
  };

  // Función para actualizar el estado de la sesión
  const updateSessionStatus = async (sessionId: number) => {
    try {
      const userCookie = Cookies.get("user");
      if (!userCookie) {
        router.push("/login");
        return;
      }
      // PATCH correcto según tu backend
      await axios.patch(
        `https://localhost:7032/api/Evaluaciones/${sessionId}/estado`,
        {
          sesionID: sessionId,
          estado: "completado",
        }
      );
    } catch (err) {
      console.error("Error al actualizar estado de sesión:", err);
      // No detenemos el flujo aunque falle esta actualización
    }
  };

  // 1. Traer datos del paciente al montar
  useEffect(() => {
    if (!pacienteId || isNaN(parseInt(pacienteId))) {
      setError("ID de paciente no válido");
      setLoading(false);
      return;
    }

    const fetchPatientData = async () => {
      try {
        const response = await axios.get(
          `https://localhost:7032/api/paciente/${pacienteId}`
        );
        setPatientData({
          nombre: response.data.nombre,
          apellido: response.data.apellido,
        });
      } catch (err) {
        console.error("Error al cargar datos del paciente:", err);
        setError("Error al cargar datos del paciente");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [pacienteId]);

  // 2. Manejo de respuestas
  const handleAnswer = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // 3. Al hacer clic "Siguiente" o "Finalizar"
  const handleNextQuestion = () => {
    if (currentQuestion < mchatQuestions.length - 1) {
      setCurrentQuestion((q) => q + 1);
    } else {
      calculateResults();
    }
  };

  // 4. "Anterior"
  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion((q) => q - 1);
  };

  // 5. Calcular puntuaciones
  const calculateResults = () => {
    const totalScore = Object.values(answers).reduce(
      (sum, val) => sum + parseInt(val, 10),
      0
    );
    const avg = totalScore / mchatQuestions.length;
    const riskLevel = avg >= 3 ? "Alto" : avg >= 2 ? "Moderado" : "Bajo";

    setResultPartial({ totalScore, avg, riskLevel });
    setShowResultsSummary(true);
  };

  // 6. Al presionar "Guardar Resultado"
  const handleSaveResult = async () => {
    if (!resultPartial) return;

    if (!manualObservations.trim()) {
      alert("Por favor ingresa las observaciones antes de guardar.");
      return;
    }

    try {
      const userCookie = Cookies.get("user");
      if (!userCookie) {
        router.push("/login");
        return;
      }
      const user = JSON.parse(userCookie);
      const empleadoId = user.EmpleadoID;
      const sessionId = parseInt(pacienteId || "0");

      // 1. Guardar el resultado primero
      await axios.post("https://localhost:7032/api/Resultado", {
        SesionID: sessionId,
        PuntuacionTotal: resultPartial.totalScore,
        PuntuacionCorte: Math.round(resultPartial.avg),
        RiesgoAutismo: resultPartial.riskLevel,
        Observaciones: manualObservations,
        FechaCalculo: new Date().toISOString(),
      });

      // 2. Actualizar el estado de la sesión
      await updateSessionStatus(sessionId);

      setSaved(true);
    } catch (err) {
      console.error("Error al guardar resultado:", err);
      setError("Error al guardar los resultados");
    }
  };

  // 7. Si está cargando datos del paciente
  if (loading) {
    return (
      <div className="min-h-screen bg-teal-50 flex items-center justify-center">
        <div>Cargando datos del paciente...</div>
      </div>
    );
  }

  // 8. Si hubo algún error
  if (error) {
    return (
      <div className="min-h-screen bg-teal-50 flex items-center justify-center">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // 9. Mostrar confirmación tras guardar definitivamente
  if (showResultsSummary && saved && resultPartial) {
    return (
      <div className="min-h-screen bg-teal-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-teal-600" />
              <span className="text-xl font-bold text-teal-700">
                AutismoCare
              </span>
            </Link>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <Card>
            <CardHeader>
              <div className="mb-4">
                <CheckCircle className="text-teal-600 w-12 h-12 mx-auto" />
              </div>
              <CardTitle className="text-2xl text-teal-700">
                Resultado Guardado
              </CardTitle>
              <CardDescription className="text-teal-600">
                Paciente: {patientData?.nombre} {patientData?.apellido}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-teal-700">
                Puntuación Total: <strong>{resultPartial.totalScore}</strong>
              </p>
              <p className="text-lg text-teal-700">
                Promedio: <strong>{resultPartial.avg.toFixed(2)}</strong>
              </p>
              <Alert>
                <AlertDescription>
                  Nivel de Riesgo:{" "}
                  <strong className="text-teal-700">
                    {resultPartial.riskLevel}
                  </strong>
                </AlertDescription>
              </Alert>
              <div className="text-left bg-teal-50 border rounded-md p-4">
                <h3 className="font-medium mb-2 text-teal-700">
                  Observaciones:
                </h3>
                <pre className="text-sm text-teal-800 overflow-x-auto">
                  {manualObservations}
                </pre>
              </div>
              <Button
                className="mt-4 bg-teal-600 hover:bg-teal-700 text-white"
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

  // 10. Mostrar sólo el resumen de resultados con botón "Agregar Observaciones"
  if (showResultsSummary && !showObservationsForm && !saved && resultPartial) {
    return (
      <div className="min-h-screen bg-teal-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-teal-600" />
              <span className="text-xl font-bold text-teal-700">
                AutismoCare
              </span>
            </Link>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Resultados Parciales</CardTitle>
              <CardDescription>
                Paciente: {patientData?.nombre} {patientData?.apellido}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">
                Puntuación Total: <strong>{resultPartial.totalScore}</strong>
              </p>
              <p className="text-lg">
                Promedio: <strong>{resultPartial.avg.toFixed(2)}</strong>
              </p>
              <Alert>
                <AlertDescription>
                  Nivel de Riesgo: <strong>{resultPartial.riskLevel}</strong>
                </AlertDescription>
              </Alert>

              <div className="flex justify-end mt-6">
                <Button
                  onClick={() => setShowObservationsForm(true)}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Agregar Observaciones
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 11. Mostrar formulario de observaciones (luego de ver el resumen)
  if (showResultsSummary && showObservationsForm && !saved && resultPartial) {
    return (
      <div className="min-h-screen bg-teal-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-teal-600" />
              <span className="text-xl font-bold text-teal-700">
                AutismoCare
              </span>
            </Link>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Agregar Observaciones</CardTitle>
              <CardDescription>
                Paciente: {patientData?.nombre} {patientData?.apellido}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Observaciones:</Label>
                <textarea
                  placeholder="Ingrese observaciones manualmente..."
                  className="w-full border rounded-md px-2 py-1 text-sm resize-none h-28 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  value={manualObservations}
                  onChange={(e) => setManualObservations(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowObservationsForm(false)}
                >
                  Volver
                </Button>
                <Button
                  className="bg-teal-600 hover:bg-teal-700"
                  onClick={handleSaveResult}
                >
                  Guardar Resultado
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 12. Mostrar preguntas del CARS-2 mientras no se hayan finalizado
  const progress = ((currentQuestion + 1) / mchatQuestions.length) * 100;
  const currentQ = mchatQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-teal-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Heart className="w-8 h-8 text-teal-600" />
            <span className="text-xl font-bold text-teal-700">AutismoCare</span>
          </Link>
          <div className="text-sm text-gray-600">
            {patientData && (
              <span>
                Paciente: {patientData.nombre} {patientData.apellido}
              </span>
            )}
          </div>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Progress
          value={progress}
          className="mb-4 bg-teal-100 [&>div]:bg-teal-600"
        />
        <Card>
          <CardHeader>
            <CardTitle>Pregunta {currentQuestion + 1}</CardTitle>
            <CardDescription>CARS-2</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-lg">{currentQ.question}</p>
            <RadioGroup
              value={answers[currentQ.id] || ""}
              onValueChange={(v) => handleAnswer(currentQ.id, v)}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id={`opt-${currentQ.id}-1`} />
                  <Label htmlFor={`opt-${currentQ.id}-1`}>
                    1 - Nunca o casi nunca
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id={`opt-${currentQ.id}-2`} />
                  <Label htmlFor={`opt-${currentQ.id}-2`}>
                    2 - Algunas veces
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id={`opt-${currentQ.id}-3`} />
                  <Label htmlFor={`opt-${currentQ.id}-3`}>
                    3 - Con frecuencia
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4" id={`opt-${currentQ.id}-4`} />
                  <Label htmlFor={`opt-${currentQ.id}-4`}>
                    4 - Siempre o casi siempre
                  </Label>
                </div>
              </div>
            </RadioGroup>
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                className="border-teal-600 text-teal-700 hover:bg-teal-100"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Anterior
              </Button>
              <Button
                className="bg-teal-600 hover:bg-teal-700 text-white"
                onClick={handleNextQuestion}
                disabled={!answers[currentQ.id]}
              >
                {currentQuestion === mchatQuestions.length - 1
                  ? "Finalizar"
                  : "Siguiente"}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

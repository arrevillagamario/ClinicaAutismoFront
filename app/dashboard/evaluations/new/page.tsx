"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Heart, ArrowRight, CheckCircle } from "lucide-react"

// Preguntas de evaluación
const mchatQuestions = [
  { id: 1, question: "¿Cómo se relaciona el niño con otras personas (niños o adultos)?" },
  { id: 2, question: "¿Imita el niño los gestos, sonidos o acciones de otras personas?" },
  { id: 3, question: "¿Cómo expresa el niño sus emociones (alegría, tristeza, enojo, etc.)?" },
  { id: 4, question: "¿Cómo usa el niño su cuerpo? ¿Muestra movimientos repetitivos o inusuales?" },
  { id: 5, question: "¿Cómo interactúa el niño con objetos o juguetes? ¿Los usa de forma funcional?" },
  { id: 6, question: "¿Cómo reacciona el niño ante cambios en su rutina o entorno?" },
  { id: 7, question: "¿Cómo responde el niño a estímulos visuales (miradas, luces, movimientos)?" },
  { id: 8, question: "¿Cómo reacciona el niño a sonidos o voces? ¿Parece escuchar normalmente?" },
  { id: 9, question: "¿Cómo responde a estímulos del tacto, olfato o gusto? ¿Tiene reacciones exageradas o poco comunes?" },
  { id: 10, question: "¿El niño muestra miedo o ansiedad? ¿Reacciona de forma inusual ante situaciones peligrosas o nuevas?" },
  { id: 11, question: "¿Cómo se comunica verbalmente el niño? ¿Habla con claridad o usa palabras apropiadas para su edad?" },
  { id: 12, question: "¿Cómo utiliza el lenguaje no verbal (gestos, expresiones faciales, posturas)?" },
  { id: 13, question: "¿Cuál es el nivel de actividad del niño? ¿Es muy inquieto o demasiado pasivo?" },
  { id: 14, question: "¿Cómo es el rendimiento intelectual del niño comparado con otros de su edad?" },
  { id: 15, question: "En general, ¿cuán evidentes son los signos de autismo en el comportamiento del niño?" }
]

export default function NewEvaluationPage() {
  const router = useRouter()
  const [selectedPatient, setSelectedPatient] = useState("")
  const [selectedTest, setSelectedTest] = useState("")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})
  const [showResults, setShowResults] = useState(false)
  const [result, setResult] = useState<{ totalScore: number; avg: number; riskLevel: string } | null>(null)
  const [evaluationStarted, setEvaluationStarted] = useState(false)

  const patients = [
    { id: 1, name: "Ana García López", age: "2 años 3 meses" },
    { id: 2, name: "Carlos Martín Ruiz", age: "1 año 8 meses" },
    { id: 3, name: "Sofía Rodríguez", age: "3 años 1 mes" }
  ]

  const tests = [
    { id: "generalEval", name: "Evaluación General", description: "Cuestionario conductual" }
  ]

  const handleStartEvaluation = () => {
    if (selectedPatient && selectedTest) setEvaluationStarted(true)
  }

  const handleAnswer = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleNextQuestion = () => {
    if (currentQuestion < mchatQuestions.length - 1) {
      setCurrentQuestion(q => q + 1)
    } else {
      calculateResults()
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion(q => q - 1)
  }

  const calculateResults = () => {
    const totalScore = Object.values(answers).reduce((sum, val) => sum + parseInt(val, 10), 0)
    const avg = totalScore / mchatQuestions.length
    const riskLevel = avg >= 3 ? "Alto" : avg >= 2 ? "Moderado" : "Bajo"
    setResult({ totalScore, avg, riskLevel })
    setShowResults(true)
  }

  const progress = ((currentQuestion + 1) / mchatQuestions.length) * 100
  const currentQ = mchatQuestions[currentQuestion]

  if (showResults && result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-teal-600" />
              <span className="text-xl font-bold">AutismoCare</span>
            </Link>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <Card>
            <CardHeader>
              <div className="mb-4">
                <CheckCircle className="text-green-600 w-12 h-12 mx-auto" />
              </div>
              <CardTitle className="text-2xl">Evaluación Completada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">Puntuación Total: <strong>{result.totalScore}</strong></p>
              <p className="text-lg">Promedio: <strong>{result.avg.toFixed(2)}</strong></p>
              <Alert>
                <AlertDescription>
                  Nivel de Riesgo: <strong>{result.riskLevel}</strong>
                </AlertDescription>
              </Alert>
              <Button className="mt-4" onClick={() => router.push("/dashboard")}>Volver al Dashboard</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!evaluationStarted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-teal-600" />
              <span className="text-xl font-bold">AutismoCare</span>
            </Link>
            <Button variant="ghost" asChild>
              <Link href="/dashboard" className="flex items-center space-x-1">
                <ArrowLeft className="w-4 h-4" />
                <span>Volver</span>
              </Link>
            </Button>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <h1 className="text-3xl font-bold">Nueva Evaluación</h1>
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger><SelectValue placeholder="Paciente" /></SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name} ({p.age})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Evaluación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tests.map(test => (
                <div key={test.id} className={`p-3 border rounded cursor-pointer ${selectedTest === test.id ? "border-teal-500 bg-teal-50" : "border-gray-200"}`} onClick={() => setSelectedTest(test.id)}>
                  <p className="font-semibold">{test.name}</p>
                  <p className="text-sm">{test.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="text-right">
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleStartEvaluation} disabled={!selectedPatient || !selectedTest}>
              Iniciar Evaluación
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Heart className="w-8 h-8 text-teal-600" />
            <span className="text-xl font-bold">AutismoCare</span>
          </Link>
          <div className="text-sm text-gray-600">Pregunta {currentQuestion + 1} de {mchatQuestions.length}</div>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Progress value={progress} className="mb-4" />
        <Card>
          <CardHeader>
            <CardTitle>Pregunta {currentQuestion + 1}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-lg">{currentQ.question}</p>
            <RadioGroup value={answers[currentQ.id] || ""} onValueChange={(v) => handleAnswer(currentQ.id, v)}>
              {[1,2,3,4].map(n => (
                <div key={n} className="flex items-center mb-2 space-x-2">
                  <RadioGroupItem value={n.toString()} id={`opt-${currentQ.id}-${n}`} />
                  <Label htmlFor={`opt-${currentQ.id}-${n}`}>{n}</Label>
                </div>
              ))}
            </RadioGroup>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestion === 0}>Anterior</Button>
              <Button onClick={handleNextQuestion} disabled={!answers[currentQ.id]}>
                {currentQuestion === mchatQuestions.length - 1 ? "Finalizar" : "Siguiente"} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

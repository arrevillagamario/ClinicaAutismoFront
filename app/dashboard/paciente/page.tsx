"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Heart, Search, UserPlus, Eye, Calendar, FileText } from "lucide-react"

export default function PacientePage() {
  const [searchTerm, setSearchTerm] = useState("")

  // Datos simulados de pacientes
  const patients = [
    {
      id: 1,
      nombre: "Ana García",
      apellido: "López",
      edad: "2 años 3 meses",
      tutor: "María López",
      telefono: "+34 666 123 456",
      ultimaEvaluacion: "2024-01-15",
      estado: "Evaluado",
      riesgo: "Bajo",
    },
    {
      id: 2,
      nombre: "Carlos Martín",
      apellido: "Ruiz",
      edad: "1 año 8 meses",
      tutor: "Juan Martín",
      telefono: "+34 666 789 012",
      ultimaEvaluacion: "2024-01-10",
      estado: "Pendiente Diagnóstico",
      riesgo: "Alto",
    },
    {
      id: 3,
      nombre: "Sofía Rodríguez",
      apellido: "Pérez",
      edad: "3 años 1 mes",
      tutor: "Carmen Rodríguez",
      telefono: "+34 666 345 678",
      ultimaEvaluacion: "2024-01-08",
      estado: "Diagnosticado",
      riesgo: "Moderado",
    },
    {
      id: 4,
      nombre: "Miguel Fernández",
      apellido: "Torres",
      edad: "2 años 6 meses",
      tutor: "Ana Torres",
      telefono: "+34 666 901 234",
      ultimaEvaluacion: null,
      estado: "Sin Evaluar",
      riesgo: null,
    },
  ]

  const filteredPatients = patients.filter(
    (patient) =>
      patient.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.tutor.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Evaluado":
        return <Badge variant="secondary">Evaluado</Badge>
      case "Pendiente Diagnóstico":
        return <Badge className="bg-orange-100 text-orange-800">Pendiente Diagnóstico</Badge>
      case "Diagnosticado":
        return <Badge className="bg-green-100 text-green-800">Diagnosticado</Badge>
      case "Sin Evaluar":
        return <Badge variant="outline">Sin Evaluar</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const getRiskBadge = (riesgo: string | null) => {
    if (!riesgo) return null

    switch (riesgo) {
      case "Alto":
        return <Badge className="bg-red-100 text-red-800">Alto</Badge>
      case "Moderado":
        return <Badge className="bg-orange-100 text-orange-800">Moderado</Badge>
      case "Bajo":
        return <Badge className="bg-green-100 text-green-800">Bajo</Badge>
      default:
        return <Badge variant="outline">{riesgo}</Badge>
    }
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
                <span className="text-xl font-bold text-gray-900">AutismoCare</span>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Resultados</h1>
            <p className="text-gray-600 mt-2">Hola Bienvenido.......</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Evaluaciones</p>
                  <p className="text-3xl font-bold text-gray-900">{patients.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <UserPlus className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Buscar Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar..."
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
            <CardTitle>Lista de Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Puntuacion</TableHead>
                  <TableHead>Riesgo de Autismo</TableHead>
                  <TableHead>Observaciones</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      {patient.nombre} {patient.apellido}
                    </TableCell>
                    <TableCell>{patient.edad}</TableCell>
                    <TableCell>{patient.tutor}</TableCell>
                    <TableCell>{patient.telefono}</TableCell>
                 
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/patients/${patient.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
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
    </div>
  )
}

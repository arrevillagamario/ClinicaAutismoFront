import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Clock, Award, Heart } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-teal-600" />
              <span className="text-xl font-bold text-gray-900">AutismoCare</span>
            </div>
           
            <div className="flex space-x-4">
              <Button variant="outline" asChild  className="bg-teal-600 text-white">
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
             
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  El Mejor Centro de <span className="text-teal-600">Evaluación</span> y{" "}
                  <span className="text-teal-600">Diagnóstico</span> de Autismo
                </h1>
                <p className="text-lg text-gray-600 max-w-lg">
                  Entendemos que la detección temprana es crucial. Nuestro equipo especializado ofrece evaluaciones
                  precisas y apoyo integral para familias.
                </p>
              </div>
              
              {/* Stats */}
            
            </div>

            {/* Doctor Image */}
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="img.jpg"
                  alt="Especialista en Autismo"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-2xl transform rotate-3 scale-105 opacity-20"></div>
            </div>
          </div>
        </div>

       
      </section>
    </div>
  )
}

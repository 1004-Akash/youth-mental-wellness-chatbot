"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wind, X } from "lucide-react"

interface BreathingExerciseProps {
  onClose: () => void
}

export function BreathingExercise({ onClose }: BreathingExerciseProps) {
  const [phase, setPhase] = useState<"breathe-in" | "hold" | "breathe-out" | "rest">("breathe-in")
  const [isActive, setIsActive] = useState(false)
  const [cycle, setCycle] = useState(0)
  const [timeLeft, setTimeLeft] = useState(4)

  const phases = {
    "breathe-in": { duration: 4, text: "Breathe In", color: "bg-blue-500" },
    hold: { duration: 4, text: "Hold", color: "bg-yellow-500" },
    "breathe-out": { duration: 6, text: "Breathe Out", color: "bg-green-500" },
    rest: { duration: 2, text: "Rest", color: "bg-gray-400" },
  }

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (isActive && timeLeft === 0) {
      // Move to next phase
      const phaseOrder: Array<keyof typeof phases> = ["breathe-in", "hold", "breathe-out", "rest"]
      const currentIndex = phaseOrder.indexOf(phase)
      const nextIndex = (currentIndex + 1) % phaseOrder.length
      const nextPhase = phaseOrder[nextIndex]

      setPhase(nextPhase)
      setTimeLeft(phases[nextPhase].duration)

      if (nextPhase === "breathe-in") {
        setCycle((prev) => prev + 1)
      }

      // Auto-stop after 3 cycles
      if (cycle >= 3 && nextPhase === "breathe-in") {
        setIsActive(false)
        setCycle(0)
      }
    }

    return () => clearInterval(interval)
  }, [isActive, timeLeft, phase, cycle])

  const startExercise = () => {
    setIsActive(true)
    setPhase("breathe-in")
    setTimeLeft(phases["breathe-in"].duration)
    setCycle(0)
  }

  const stopExercise = () => {
    setIsActive(false)
    setPhase("breathe-in")
    setTimeLeft(phases["breathe-in"].duration)
    setCycle(0)
  }

  const currentPhase = phases[phase]

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-200 relative">
      <Button variant="ghost" size="sm" onClick={onClose} className="absolute top-2 right-2 h-6 w-6 p-0">
        <X className="h-4 w-4" />
      </Button>

      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Wind className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Breathing Exercise</h3>
        </div>

        {!isActive ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-pretty">
              Take a moment to breathe and center yourself. This 4-4-6 breathing pattern can help reduce stress and
              anxiety.
            </p>
            <Button onClick={startExercise} className="w-full">
              Start Breathing Exercise
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative">
              <div
                className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full mx-auto transition-all duration-1000 ${currentPhase.color} flex items-center justify-center`}
                style={{
                  transform: phase === "breathe-in" ? "scale(1.2)" : phase === "hold" ? "scale(1.2)" : "scale(1)",
                  opacity: phase === "rest" ? 0.6 : 1,
                }}
              >
                <div className="text-white font-bold text-lg sm:text-xl">{timeLeft}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xl sm:text-2xl font-semibold text-gray-800">{currentPhase.text}</div>
              <div className="text-sm text-muted-foreground">Cycle {cycle + 1} of 3</div>
            </div>

            <Button onClick={stopExercise} variant="outline" size="sm">
              Stop Exercise
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

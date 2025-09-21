"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { createSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, BarChart3 } from "lucide-react"
import Link from "next/link"
import { BreathingExercise } from "./breathing-exercise"

interface Message {
  id: string
  message: string
  is_user: boolean
  created_at: string
  show_breathing_exercise?: boolean
}

interface ChatInterfaceProps {
  userId: string
}

export function ChatInterface({ userId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)
  const [showBreathingExercise, setShowBreathingExercise] = useState(false)
  const [breathingExerciseShown, setBreathingExerciseShown] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createSupabaseClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    loadMessages()
  }, [userId])

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(50)

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("Error loading messages:", error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isLoading) return

    const userMessage = newMessage.trim()
    setNewMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          breathingExerciseShown: breathingExerciseShown,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to process message")
      }

      if (data.showBreathingExercise) {
        setShowBreathingExercise(true)
        setBreathingExerciseShown(true)
      }

      await loadMessages()
    } catch (error) {
      console.error("Error sending message:", error)

      try {
        await supabase.from("chat_messages").insert({
          user_id: userId,
          message: userMessage,
          is_user: true,
        })

        await supabase.from("chat_messages").insert({
          user_id: userId,
          message: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
          is_user: false,
        })

        await loadMessages()
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingMessages) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center animate-pulse">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="text-muted-foreground">Loading your conversation...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-2 sm:p-6">
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-20 h-20 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Hi there! I'm Saathi</h3>
              <p className="text-muted-foreground text-base max-w-lg mx-auto mb-6">
                I'm here to listen and support you on your mental wellness journey. Feel free to share what's on your
                mind - I'm here for you.
              </p>
              <Button asChild variant="outline">
                <Link href="/mood" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Track Your Mood
                </Link>
              </Button>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="space-y-4">
                <div className={`flex gap-3 sm:gap-4 ${message.is_user ? "justify-end" : "justify-start"}`}>
                  {!message.is_user && (
                    <Avatar className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-600 flex-shrink-0">
                      <AvatarFallback className="bg-teal-600">
                        <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <Card
                    className={`max-w-[85%] sm:max-w-[75%] p-4 sm:p-5 ${
                      message.is_user ? "bg-teal-600 text-white border-teal-600" : "bg-white border border-gray-200"
                    }`}
                  >
                    <p className="text-sm sm:text-base">{message.message}</p>
                  </Card>
                  {message.is_user && (
                    <Avatar className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-400 flex-shrink-0">
                      <AvatarFallback className="bg-gray-400">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>

                {!message.is_user && message.show_breathing_exercise && (
                  <div className="ml-12 sm:ml-14">
                    <BreathingExercise onClose={() => setShowBreathingExercise(false)} />
                  </div>
                )}
              </div>
            ))
          )}

          {showBreathingExercise && (
            <div className="ml-12 sm:ml-14">
              <BreathingExercise onClose={() => setShowBreathingExercise(false)} />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t bg-background p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Share what's on your mind..."
              disabled={isLoading}
              className="flex-1 text-sm sm:text-base"
            />
            <Button type="submit" disabled={isLoading || !newMessage.trim()} className="bg-teal-600 hover:bg-teal-700">
              <Send className="w-4 h-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

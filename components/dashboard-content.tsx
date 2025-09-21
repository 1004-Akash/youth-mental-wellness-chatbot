"use client"

import { useState, useEffect } from "react"
import { createSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, BarChart3, Heart, TrendingUp, Lightbulb, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { format, subDays, startOfDay } from "date-fns"

interface MoodEntry {
  id: string
  mood_level: number
  triggers: string[]
  notes: string
  created_at: string
}

interface ChatMessage {
  id: string
  message: string
  is_user: boolean
  created_at: string
}

interface CopingStrategy {
  id: string
  title: string
  description: string
  category: string
}

interface DashboardContentProps {
  userId: string
}

export function DashboardContent({ userId }: DashboardContentProps) {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [recentMessages, setRecentMessages] = useState<ChatMessage[]>([])
  const [copingStrategies, setCopingStrategies] = useState<CopingStrategy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadDashboardData()
  }, [userId])

  const loadDashboardData = async () => {
    try {
      // Load recent mood entries (last 7 days)
      const sevenDaysAgo = startOfDay(subDays(new Date(), 7))
      const { data: moods } = await supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false })

      // Load recent chat messages
      const { data: messages } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(6)

      // Load recommended coping strategies
      const { data: strategies } = await supabase.from("coping_strategies").select("*").limit(3)

      setMoodEntries(moods || [])
      setRecentMessages(messages || [])
      setCopingStrategies(strategies || [])
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getMoodAverage = () => {
    if (moodEntries.length === 0) return 0
    const sum = moodEntries.reduce((acc, entry) => acc + entry.mood_level, 0)
    return Math.round(sum / moodEntries.length)
  }

  const getMoodTrend = () => {
    if (moodEntries.length < 2) return "stable"
    const recent = moodEntries.slice(0, 3)
    const older = moodEntries.slice(3, 6)

    if (recent.length === 0 || older.length === 0) return "stable"

    const recentAvg = recent.reduce((acc, entry) => acc + entry.mood_level, 0) / recent.length
    const olderAvg = older.reduce((acc, entry) => acc + entry.mood_level, 0) / older.length

    if (recentAvg > olderAvg + 0.5) return "improving"
    if (recentAvg < olderAvg - 0.5) return "declining"
    return "stable"
  }

  const getMoodIcon = (level: number) => {
    if (level >= 7) return <div className="w-2 h-2 rounded-full bg-green-500"></div>
    if (level >= 4) return <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
    return <div className="w-2 h-2 rounded-full bg-red-500"></div>
  }

  const getTrendIcon = (trend: string) => {
    if (trend === "improving") return <TrendingUp className="w-4 h-4 text-green-500" />
    if (trend === "declining") return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
    return <TrendingUp className="w-4 h-4 text-gray-500" />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center animate-pulse">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="text-muted-foreground font-medium">Loading your dashboard...</div>
        </div>
      </div>
    )
  }

  const moodAverage = getMoodAverage()
  const moodTrend = getMoodTrend()

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Welcome back to Saathi</h1>
          <p className="text-muted-foreground mt-2 text-base sm:text-lg">Here's how you've been doing lately</p>
        </div>
        <Button asChild className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white">
          <Link href="/chat" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Chat with Saathi
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">7-Day Mood Average</CardTitle>
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              {getMoodIcon(moodAverage)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moodAverage === 0 ? "NaN" : moodAverage}/10</div>
            <div className="flex items-center gap-2 text-sm text-blue-600 mt-1">
              {getTrendIcon(moodTrend)}
              <span className="font-medium">Stable</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Mood Entries</CardTitle>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-gray-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moodEntries.length}</div>
            <p className="text-sm text-gray-500">This week</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Chat Sessions</CardTitle>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-gray-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.ceil(recentMessages.length / 2)}</div>
            <p className="text-sm text-gray-500">Recent conversations</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle className="text-lg font-semibold">Recent Mood Entries</CardTitle>
            <CardDescription className="text-gray-600">Your mood patterns over the last 7 days</CardDescription>
          </div>
          <Button
            variant="outline"
            asChild
            className="w-full sm:w-auto border-gray-200 hover:bg-gray-50 bg-transparent"
          >
            <Link href="/mood" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Track Mood
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {moodEntries.length > 0 ? (
            <div className="space-y-3">
              {moodEntries.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      {getMoodIcon(entry.mood_level)}
                    </div>
                    <div>
                      <div className="font-medium">{entry.mood_level}/10</div>
                      <div className="text-sm text-gray-500">{format(new Date(entry.created_at), "MMM d, yyyy")}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {entry.triggers?.slice(0, 2).map((trigger) => (
                      <Badge
                        key={trigger}
                        variant="secondary"
                        className="text-xs bg-orange-100 text-orange-800 border-orange-200"
                      >
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No mood entries yet</p>
              <Button asChild className="bg-teal-600 hover:bg-teal-700">
                <Link href="/mood">Track Your First Mood</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            <Lightbulb className="w-5 h-5 text-gray-600" />
            Recommended for You
          </CardTitle>
          <CardDescription className="text-gray-600">Coping strategies that might help you today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-white border-l-4 border-l-teal-500 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Deep Breathing Exercise</CardTitle>
                <Badge variant="outline" className="w-fit text-xs bg-teal-50 text-teal-700 border-teal-200">
                  breathing
                </Badge>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600">A simple breathing technique to reduce anxiety and stress</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-l-4 border-l-teal-500 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">5-4-3-2-1 Grounding Technique</CardTitle>
                <Badge variant="outline" className="w-fit text-xs bg-teal-50 text-teal-700 border-teal-200">
                  mindfulness
                </Badge>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600">Use your senses to ground yourself in the present moment</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-l-4 border-l-teal-500 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Quick Walk</CardTitle>
                <Badge variant="outline" className="w-fit text-xs bg-teal-50 text-teal-700 border-teal-200">
                  physical
                </Badge>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600">Take a short walk to clear your mind and boost mood</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-teal-50 border border-teal-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg font-semibold">
              <MessageCircle className="w-5 h-5 text-teal-600" />
              Continue Your Journey
            </CardTitle>
            <CardDescription className="text-gray-600">Chat with Saathi about how you're feeling today</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-teal-600 hover:bg-teal-700 text-white">
              <Link href="/chat" className="flex items-center gap-2">
                Start Conversation
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-pink-50 border border-pink-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg font-semibold">
              <Heart className="w-5 h-5 text-pink-600" />
              Self-Care Check
            </CardTitle>
            <CardDescription className="text-gray-600">Take a moment to reflect on your current mood</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              variant="outline"
              className="w-full border-pink-200 hover:bg-pink-50 text-pink-700 bg-transparent"
            >
              <Link href="/mood" className="flex items-center gap-2">
                Track Mood
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { createSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { format } from "date-fns"

interface MoodEntry {
  id: string
  mood_score: number
  mood_label: string
  notes: string | null
  triggers: string[] | null
  created_at: string
}

interface MoodTrackerProps {
  userId: string
}

const moodOptions = [
  { score: 1, label: "very_sad", emoji: "😢", text: "Very Sad", color: "bg-red-100 text-red-800 border-red-200" },
  { score: 3, label: "sad", emoji: "😔", text: "Sad", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { score: 5, label: "neutral", emoji: "😐", text: "Neutral", color: "bg-gray-100 text-gray-800 border-gray-200" },
  { score: 7, label: "happy", emoji: "😊", text: "Happy", color: "bg-green-100 text-green-800 border-green-200" },
  {
    score: 10,
    label: "very_happy",
    emoji: "😄",
    text: "Very Happy",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
]

const commonTriggers = [
  "Academic Stress",
  "Social Pressure",
  "Family Issues",
  "Financial Worry",
  "Health Concerns",
  "Relationship Problems",
  "Work Stress",
  "Sleep Issues",
  "Weather",
  "Social Media",
  "News/Current Events",
  "Physical Pain",
]

export function MoodTracker({ userId }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [notes, setNotes] = useState("")
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([])
  const [recentEntries, setRecentEntries] = useState<MoodEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadRecentEntries()
  }, [userId])

  const loadRecentEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(7)

      if (error) throw error
      setRecentEntries(data || [])
    } catch (error) {
      console.error("Error loading mood entries:", error)
    }
  }

  const handleMoodSubmit = async () => {
    if (!selectedMood) return

    setIsLoading(true)
    try {
      const moodOption = moodOptions.find((m) => m.score === selectedMood)

      const { error } = await supabase.from("mood_entries").insert({
        user_id: userId,
        mood_score: selectedMood,
        mood_label: moodOption?.label || "neutral",
        notes: notes.trim() || null,
        triggers: selectedTriggers.length > 0 ? selectedTriggers : null,
      })

      if (error) throw error

      // Reset form
      setSelectedMood(null)
      setNotes("")
      setSelectedTriggers([])

      // Reload entries
      await loadRecentEntries()
    } catch (error) {
      console.error("Error saving mood entry:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers((prev) => (prev.includes(trigger) ? prev.filter((t) => t !== trigger) : [...prev, trigger]))
  }

  const getMoodTrend = () => {
    if (recentEntries.length < 2) return null

    const recent = recentEntries[0]?.mood_score || 0
    const previous = recentEntries[1]?.mood_score || 0

    if (recent > previous) return "up"
    if (recent < previous) return "down"
    return "stable"
  }

  const averageMood =
    recentEntries.length > 0
      ? recentEntries.reduce((sum, entry) => sum + entry.mood_score, 0) / recentEntries.length
      : 0

  return (
    <div className="space-y-8">
      <Card className="backdrop-blur-glass bg-card/80 border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-3 text-2xl font-bold text-balance">
            How are you feeling today?
            <Popover open={showCalendar} onOpenChange={setShowCalendar}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit backdrop-blur-glass bg-transparent border-primary/20 hover:bg-primary/5"
                >
                  <CalendarIcon className="w-4 h-4" />
                  {format(selectedDate, "MMM dd")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 backdrop-blur-glass" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date)
                      setShowCalendar(false)
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Select your mood:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {moodOptions.map((mood) => (
                <Button
                  key={mood.score}
                  variant={selectedMood === mood.score ? "default" : "outline"}
                  className={`h-auto p-4 sm:p-6 flex flex-col gap-2 transition-all duration-200 ${
                    selectedMood === mood.score
                      ? "gradient-primary shadow-lg scale-105"
                      : "backdrop-blur-glass bg-card/60 hover:bg-card/80 hover:scale-105"
                  }`}
                  onClick={() => setSelectedMood(mood.score)}
                >
                  <span className="text-2xl sm:text-3xl">{mood.emoji}</span>
                  <span className="text-xs sm:text-sm font-medium">{mood.text}</span>
                </Button>
              ))}
            </div>
          </div>

          {selectedMood && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-pretty">What might have influenced your mood? (optional)</h3>
              <div className="flex flex-wrap gap-2">
                {commonTriggers.map((trigger) => (
                  <Badge
                    key={trigger}
                    variant={selectedTriggers.includes(trigger) ? "default" : "outline"}
                    className={`cursor-pointer text-sm py-2 px-3 transition-all duration-200 ${
                      selectedTriggers.includes(trigger)
                        ? "gradient-primary text-white shadow-md"
                        : "backdrop-blur-glass bg-card/60 hover:bg-card/80"
                    }`}
                    onClick={() => toggleTrigger(trigger)}
                  >
                    {trigger}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {selectedMood && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Any additional thoughts? (optional)</h3>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Share what's on your mind..."
                className="min-h-[100px] text-sm sm:text-base backdrop-blur-glass bg-input/80 border-border/50 focus:border-primary/50"
              />
            </div>
          )}

          {selectedMood && (
            <Button
              onClick={handleMoodSubmit}
              disabled={isLoading}
              className="w-full gradient-primary shadow-lg hover:shadow-xl transition-all duration-200 py-3 text-base font-semibold"
            >
              {isLoading ? "Saving..." : "Save Mood Entry"}
            </Button>
          )}
        </CardContent>
      </Card>

      {recentEntries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card className="backdrop-blur-glass bg-card/80 border-border/50 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">Recent Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {getMoodTrend() === "up" && (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-green-600 font-bold text-lg">Improving</span>
                  </>
                )}
                {getMoodTrend() === "down" && (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-red-600 font-bold text-lg">Declining</span>
                  </>
                )}
                {getMoodTrend() === "stable" && (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-slate-600 flex items-center justify-center">
                      <Minus className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-600 font-bold text-lg">Stable</span>
                  </>
                )}
                {!getMoodTrend() && <span className="text-muted-foreground font-medium">Not enough data</span>}
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-glass bg-card/80 border-border/50 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">7-Day Average</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {
                    moodOptions.find(
                      (m) =>
                        Math.abs(m.score - averageMood) ===
                        Math.min(...moodOptions.map((opt) => Math.abs(opt.score - averageMood))),
                    )?.emoji
                  }
                </span>
                <span className="font-bold text-2xl">{averageMood.toFixed(1)}/10</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {recentEntries.length > 0 && (
        <Card className="backdrop-blur-glass bg-card/80 border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEntries.map((entry) => {
                const moodOption = moodOptions.find((m) => m.label === entry.mood_label)
                return (
                  <div
                    key={entry.id}
                    className="flex items-start gap-4 p-4 rounded-xl backdrop-blur-glass bg-muted/30 border border-border/30 hover:bg-muted/50 transition-all duration-200"
                  >
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">{moodOption?.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                        <span className="font-bold text-base">{moodOption?.text}</span>
                        <span className="text-sm text-muted-foreground font-medium">
                          {format(new Date(entry.created_at), "MMM dd, h:mm a")}
                        </span>
                      </div>
                      {entry.triggers && entry.triggers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {entry.triggers.map((trigger, index) => (
                            <Badge key={index} variant="secondary" className="text-xs backdrop-blur-glass">
                              {trigger}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground text-pretty leading-relaxed">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

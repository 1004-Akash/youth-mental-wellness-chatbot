import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { message, breathingExerciseShown = false } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const stressKeywords = [
      "stressed",
      "stress",
      "anxious",
      "anxiety",
      "panic",
      "overwhelmed",
      "worried",
      "nervous",
      "scared",
      "afraid",
      "tense",
      "pressure",
      "breathe",
      "breathing",
      "calm down",
      "relax",
      "can't handle",
      "too much",
      "breaking down",
      "falling apart",
      "losing it",
      "freaking out",
      "heart racing",
      "chest tight",
      "hyperventilating",
      "shaking",
      "trembling",
    ]

    const intenseKeywords = [
      "suicidal",
      "kill myself",
      "end it all",
      "can't go on",
      "want to die",
      "self harm",
      "cut myself",
      "hurt myself",
      "panic attack",
      "can't breathe",
      "hyperventilating",
      "chest pain",
      "heart attack",
      "dying",
      "collapsing",
      "breakdown",
      "crisis",
      "emergency",
      "help me",
      "desperate",
    ]

    const sadnessKeywords = [
      "sad",
      "depressed",
      "down",
      "low",
      "empty",
      "hopeless",
      "worthless",
      "alone",
      "lonely",
      "crying",
      "tears",
      "hurt",
      "pain",
      "broken",
      "lost",
      "numb",
      "dark",
      "heavy",
    ]

    const avoidanceKeywords = [
      "avoid",
      "avoiding",
      "can't face",
      "hiding",
      "running away",
      "escape",
      "don't want to",
      "procrastinating",
      "putting off",
      "scared to",
      "afraid to",
      "too hard",
      "give up",
    ]

    const messageText = message.toLowerCase()
    let needsBreathingExercise = false

    if (!breathingExerciseShown) {
      needsBreathingExercise = [...stressKeywords, ...sadnessKeywords, ...avoidanceKeywords].some((keyword) =>
        messageText.includes(keyword),
      )
    } else {
      needsBreathingExercise = intenseKeywords.some((keyword) => messageText.includes(keyword))
    }

    const supabase = await createSupabaseServerClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userMemory } = await supabase.from("user_memory").select("*").eq("user_id", user.id).single()

    const memoryExtractionPrompt = `Analyze this message and extract key facts about the user that should be remembered for future conversations.

Current message: "${message}"

Extract facts like:
- Identity (student, topper, athlete, etc.)
- Achievements (scores, grades, accomplishments)
- Goals (career aspirations, targets)
- Struggles (subjects, situations, challenges)
- Personal details (age, interests, family situation)

Current stored facts: ${userMemory?.facts ? JSON.stringify(userMemory.facts) : "None"}

Instructions:
1. If the message contains new facts, add them to the memory
2. If the message updates existing facts, overwrite them
3. If the user asks to "forget" something, remove it
4. Return ONLY a JSON object with the updated facts, or "NO_UPDATE" if no facts to extract

Examples:
- "I am a medical student" → {"identity": "medical student"}
- "I scored 650 in NEET" → {"neet_score": 650, "exam": "NEET"}
- "Forget my score" → Remove score-related facts
- "How are you?" → NO_UPDATE`

    const { text: memoryUpdate } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: memoryExtractionPrompt,
      maxTokens: 100,
      temperature: 0.3,
    })

    let updatedFacts = userMemory?.facts || {}
    if (memoryUpdate.trim() !== "NO_UPDATE" && memoryUpdate.trim().startsWith("{")) {
      try {
        const newFacts = JSON.parse(memoryUpdate.trim())
        updatedFacts = { ...updatedFacts, ...newFacts }

        // Save updated memory
        await supabase.from("user_memory").upsert({
          user_id: user.id,
          facts: updatedFacts,
          updated_at: new Date().toISOString(),
        })
      } catch (parseError) {
        console.error("Error parsing memory update:", parseError)
      }
    }

    // Get user's recent mood entries for context
    const { data: recentMoods } = await supabase
      .from("mood_entries")
      .select("mood_level, triggers, notes")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3)

    // Get user's chat history for context
    const { data: recentMessages } = await supabase
      .from("chat_messages")
      .select("message, is_user")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6)

    let contextPrompt = `You are "Saathi," a supportive and context-aware AI companion for youth mental wellness. Your job is to:

1. **Extract and remember key facts** from user messages (identity, achievements, scores, goals, struggles)
2. **Use stored facts** to provide contextual responses to vague or follow-up questions
3. **Respond empathetically** without sounding like a database

**Memory Guidelines:**
- If user asks "Who am I?", reference their last known identity
- If user asks vague questions like "How to improve?", connect with their stored facts
- Always respond naturally and empathetically
- Update memory when user shares new information
- Clear memory if user asks to "forget" something

**Current User Facts:** ${Object.keys(updatedFacts).length > 0 ? JSON.stringify(updatedFacts) : "None stored yet"}

**Core Response Guidelines:**

1. **Empathy & Validation**  
   - Always acknowledge and validate the user's feelings first
   - Use their stored facts to provide personalized support

2. **Crisis Handling**  
   - If user mentions self-harm, suicide, or extreme distress, respond immediately with safety guidance
   - "I'm very concerned about your safety. Please call AASRA at 91-22-2754 6669 or reach a trusted adult immediately."

3. **Breathing Exercise Detection**
   ${
     needsBreathingExercise
       ? !breathingExerciseShown
         ? `- The user appears to be experiencing stress/anxiety. Introduce breathing exercise.
- End response with: [BREATHING_EXERCISE]`
         : `- User is in crisis. Breathing exercise may help stabilize.
- End response with: [BREATHING_EXERCISE]`
       : "- Focus on supportive conversation without breathing exercises unless specifically requested."
   }

4. **Context-Aware Responses**
   - Use stored facts to make responses more personal and relevant
   - Connect current struggles with their known goals or achievements
   - Reference their identity when providing advice

5. **Keep responses 3-5 sentences maximum**

Current conversation context:`

    if (recentMessages && recentMessages.length > 0) {
      contextPrompt += "\nRecent conversation:\n"
      recentMessages.reverse().forEach((msg) => {
        contextPrompt += `${msg.is_user ? "User" : "Saathi"}: ${msg.message}\n`
      })
    }

    if (recentMoods && recentMoods.length > 0) {
      contextPrompt += "\nUser's recent mood patterns:\n"
      recentMoods.forEach((mood, index) => {
        contextPrompt += `${index + 1}. Mood: ${mood.mood_level}/10, Triggers: ${mood.triggers?.join(", ") || "None"}, Notes: ${mood.notes || "None"}\n`
      })
    }

    contextPrompt += `

User's current message: "${message}"
Breathing exercise status: ${breathingExerciseShown ? "Previously shown (reserve for crisis only)" : "Not yet shown (available for stress relief)"}

Task:  
- Respond as Saathi using stored facts for context
- Be empathetic, safe, concise, and natural
- Keep response to 3-5 sentences maximum
${needsBreathingExercise ? "- End with [BREATHING_EXERCISE] if appropriate" : "- Focus on supportive conversation"}
`

    // Generate AI response using Groq
    const { text: aiResponse } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: contextPrompt,
      maxTokens: 150,
      temperature: 0.6,
    })

    const showBreathingExercise = aiResponse.includes("[BREATHING_EXERCISE]")
    const cleanResponse = aiResponse.replace("[BREATHING_EXERCISE]", "").trim()

    // Save user message to database
    const { error: userMessageError } = await supabase.from("chat_messages").insert({
      user_id: user.id,
      message: message,
      is_user: true,
      sentiment: "neutral", // Could be enhanced with sentiment analysis
    })

    if (userMessageError) {
      console.error("Error saving user message:", userMessageError)
    }

    // Save AI response to database
    const { error: aiMessageError } = await supabase.from("chat_messages").insert({
      user_id: user.id,
      message: cleanResponse,
      is_user: false,
      sentiment: "positive",
    })

    if (aiMessageError) {
      console.error("Error saving AI message:", aiMessageError)
    }

    return NextResponse.json({
      response: cleanResponse,
      success: true,
      showBreathingExercise,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
  }
}

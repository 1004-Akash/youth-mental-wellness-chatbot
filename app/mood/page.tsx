import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { MoodTracker } from "@/components/mood-tracker"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Heart } from "lucide-react"

export default async function MoodPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen flex flex-col">
          <header className="border-b bg-card/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 p-4">
              <SidebarTrigger className="md:hidden" />
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">Mood Tracker</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Track your emotional wellbeing</p>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4">
            <div className="container mx-auto max-w-2xl">
              <MoodTracker userId={user.id} />
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

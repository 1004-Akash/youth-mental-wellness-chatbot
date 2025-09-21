import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ChatInterface } from "@/components/chat-interface"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Heart } from "lucide-react"

export default async function ChatPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="h-screen flex flex-col">
          <header className="border-b bg-card/80 backdrop-blur-sm">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="md:hidden" />
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h1 className="font-semibold text-lg">Saathi</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Welcome back, {profile?.display_name || "Friend"}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Chat Interface */}
          <main className="flex-1 overflow-hidden">
            <ChatInterface userId={user.id} />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

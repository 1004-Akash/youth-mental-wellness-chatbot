import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { SettingsContent } from "@/components/settings-content"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Settings } from "lucide-react"

export default async function SettingsPage() {
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
              <Settings className="w-5 h-5 text-muted-foreground" />
              <div>
                <h1 className="font-semibold text-lg">Settings</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Manage your account and preferences</p>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4">
            <div className="container mx-auto max-w-2xl">
              <SettingsContent user={user} />
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

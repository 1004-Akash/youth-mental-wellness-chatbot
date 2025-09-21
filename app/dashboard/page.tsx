import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { DashboardContent } from "@/components/dashboard-content"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center gap-3 p-4 border-b backdrop-blur-glass bg-background/80 md:hidden">
        <SidebarTrigger />
        <h1 className="font-bold text-lg">Dashboard</h1>
      </header>
      <main className="flex-1">
        <DashboardContent userId={user.id} />
      </main>
    </div>
  )
}

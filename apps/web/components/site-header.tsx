
'use client' 
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { trpc } from "~/trpc/client" 

import { useRouter } from "next/navigation"

export function SiteHeader() { 
  
  const dataQuery = trpc.auth.getLoggedInUserInfo.useQuery()
  const data = dataQuery.data   

  const router = useRouter() 
  const utils = trpc.useUtils()  


  const logoutMutation = trpc.auth.logoutUser.useMutation({
    onSuccess: async () => {

      // clear cached user data
      await utils.auth.getLoggedInUserInfo.invalidate()

      // redirect user
      router.push("/signup")

      // refresh app state
      router.refresh()
    }
  })  


  // logout handler
  const handleLogout = async () => {
    await logoutMutation.mutateAsync()
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex flex-col gap-0.5">
          <h1 className="text-base font-medium"></h1>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{data?.fullName}</span>. Admin
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
    </header>
  )
}

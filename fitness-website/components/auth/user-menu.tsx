// "use client"
// import { Button } from "@/components/ui/button"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// import { useAuth } from "@/contexts/auth-context"
// import { User, Settings, BookOpen, LogOut, Shield } from "lucide-react"
// import Link from "next/link"

// export function UserMenu() {
//   const { user, logout,  login  } = useAuth()

//   if (!user) return null
//   if (!login) return null // Ensure user data is loaded before rendering

//     // Function to get the initials from the user's name
//     // This function splits the user's name into words, takes the first letter of each word,
//   const getInitials = (name: string) => {
//     return name
//       .split(" ")
//       .map((word) => word[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 2)
//   }

//   const handleLogout = () => {
//     logout()
//   }

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant="ghost" className="relative h-8 w-8 rounded-full">
//           <Avatar className="h-8 w-8">
//             <AvatarFallback className="bg-blue-600 text-white">{getInitials(user.name)}</AvatarFallback>
//           </Avatar>
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent className="w-56" align="end" forceMount>
//         <DropdownMenuLabel className="font-normal">
//           <div className="flex flex-col space-y-1">
//             <p className="text-sm font-medium leading-none">{user.name}</p>
//             <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
//             {user.role === "admin" && (
//               <div className="flex items-center gap-1 mt-1">
//                 <Shield className="h-3 w-3 text-purple-600" />
//                 <span className="text-xs text-purple-600 font-medium">Admin</span>
//               </div>
//             )}
//           </div>
//         </DropdownMenuLabel>
//         <DropdownMenuSeparator />
//         <DropdownMenuItem asChild>
//           <Link href="/dashboard" className="flex items-center">
//             <User className="mr-2 h-4 w-4" />
//             <span>Dashboard</span>
//           </Link>
//         </DropdownMenuItem>
//         <DropdownMenuItem asChild>
//           <Link href="/courses" className="flex items-center">
//             <BookOpen className="mr-2 h-4 w-4" />
//             <span>My Courses</span>
//           </Link>
//         </DropdownMenuItem>
//         {user.role === "admin" && (
//           <DropdownMenuItem asChild>
//             <Link href="/admin/dashboard" className="flex items-center">
//               <Shield className="mr-2 h-4 w-4" />
//               <span>Admin Panel</span>
//             </Link>
//           </DropdownMenuItem>
//         )}
//         <DropdownMenuItem className="flex items-center">
//           <Settings className="mr-2 h-4 w-4" />
//           <span>Settings</span>
//         </DropdownMenuItem>
//         <DropdownMenuSeparator />
//         <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-600">
//           <LogOut className="mr-2 h-4 w-4" />
//           <span>Log out</span>
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   )
// }
// "use client"

// import { useState } from "react"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { useAuth } from "@/contexts/auth-context"
// import { User, Settings, LogOut, BookOpen, Activity } from "lucide-react"

// export function UserMenu() {
//   const { user, logout } = useAuth()
//   const [isLoggingOut, setIsLoggingOut] = useState(false)

//   const handleLogout = async () => {
//     setIsLoggingOut(true)
//     try {
//       await logout()
//     } catch (error) {
//       console.error("Logout failed:", error)
//     } finally {
//       setIsLoggingOut(false)
//     }
//   }

//   if (!user) return null

//   const initials = user.name
//     .split(" ")
//     .map((n) => n[0])
//     .join("")
//     .toUpperCase()

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant="ghost" className="relative h-8 w-8 rounded-full">
//           <Avatar className="h-8 w-8">
//             <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
//             <AvatarFallback>{initials}</AvatarFallback>
//           </Avatar>
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent className="w-56" align="end" forceMount>
//         <DropdownMenuLabel className="font-normal">
//           <div className="flex flex-col space-y-1">
//             <p className="text-sm font-medium leading-none">{user.name}</p>
//             <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
//           </div>
//         </DropdownMenuLabel>
//         <DropdownMenuSeparator />
//         <DropdownMenuItem asChild>
//           <Link href="/dashboard" className="flex items-center">
//             <User className="mr-2 h-4 w-4" />
//             <span>Dashboard</span>
//           </Link>
//         </DropdownMenuItem>
//         <DropdownMenuItem asChild>
//           <Link href="/dashboard?tab=courses" className="flex items-center">
//             <BookOpen className="mr-2 h-4 w-4" />
//             <span>My Courses</span>
//           </Link>
//         </DropdownMenuItem>
//         <DropdownMenuItem asChild>
//           <Link href="/dashboard?tab=activity" className="flex items-center">
//             <Activity className="mr-2 h-4 w-4" />
//             <span>Activity</span>
//           </Link>
//         </DropdownMenuItem>
//         <DropdownMenuItem asChild>
//           <Link href="/settings" className="flex items-center">
//             <Settings className="mr-2 h-4 w-4" />
//             <span>Settings</span>
//           </Link>
//         </DropdownMenuItem>
//         <DropdownMenuSeparator />
//         <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
//           <LogOut className="mr-2 h-4 w-4" />
//           <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   )
// }
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { User, Settings, LogOut, BookOpen, Activity } from "lucide-react"
import Link from "next/link"

export function UserMenu() {
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  if (!user) return null

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard?tab=my-courses" className="cursor-pointer">
            <BookOpen className="mr-2 h-4 w-4" />
            <span>My Courses</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard?tab=activity" className="cursor-pointer">
            <Activity className="mr-2 h-4 w-4" />
            <span>Activity</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

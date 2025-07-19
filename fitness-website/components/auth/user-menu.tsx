"use client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { User, Settings, BookOpen, LogOut, Shield } from "lucide-react"
import Link from "next/link"

export function UserMenu() {
  const { user, logout,  isInitialized  } = useAuth()

  if (!user) return null
  if (!isInitialized) return null // Ensure user data is loaded before rendering

    // Function to get the initials from the user's name
    // This function splits the user's name into words, takes the first letter of each word,
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-600 text-white">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            {user.role === "admin" && (
              <div className="flex items-center gap-1 mt-1">
                <Shield className="h-3 w-3 text-purple-600" />
                <span className="text-xs text-purple-600 font-medium">Admin</span>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/courses" className="flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            <span>My Courses</span>
          </Link>
        </DropdownMenuItem>
        {user.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin/dashboard" className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin Panel</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="flex items-center">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

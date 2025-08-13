
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
//   const { user, logout } = useAuth()

//   if (!user) return null

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
// import { User, LogOut, BookOpen, LayoutDashboard } from "lucide-react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"

// export function UserMenu() {
//   const { user, logout } = useAuth()
//   const router = useRouter()

//   if (!user) return null

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
//             <AvatarFallback className="bg-blue-600 text-white">
//               {getInitials(user.name)}
//             </AvatarFallback>
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

//         <DropdownMenuItem onClick={() => router.push("/dashboard")}>
//           <LayoutDashboard className="mr-2 h-4 w-4" />
//           <span>Dashboard</span>
//         </DropdownMenuItem>

//         <DropdownMenuItem onClick={() => router.push("/courses")}>
//           <BookOpen className="mr-2 h-4 w-4" />
//           <span>My Courses</span>
//         </DropdownMenuItem>

//         <DropdownMenuItem onClick={() => router.push("/profile")}>
//           <User className="mr-2 h-4 w-4" />
//           <span>My Profile</span>
//         </DropdownMenuItem>

//         <DropdownMenuSeparator />

//         <DropdownMenuItem onClick={handleLogout} className="text-red-600">
//           <LogOut className="mr-2 h-4 w-4" />
//           <span>Log out</span>
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   )
// }
"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  LogOut,
  BookOpen,
  LayoutDashboard,
} from "lucide-react";

// Function to get initials from a full name, with a fallback
const getUserInitials = (name: string): string => {
  if (!name) return "G"; // 'G' for Guest or a default placeholder
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return initials || "U"; // 'U' for User if initials are not generated
};

// UserMenu component
export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Don't render the menu if there is no user
  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const menuItems = [
    {
      label: "My Profile",
      icon: UserIcon,
      path: "/profile",
    },
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full transition-all duration-200 hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-gradient-to-tr from-blue-500 to-purple-600 text-sm font-semibold text-white">
              {getUserInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-base font-medium leading-none">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {menuItems.map((item) => (
          <DropdownMenuItem
            key={item.label}
            onClick={() => router.push(item.path)}
            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center space-x-2 cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
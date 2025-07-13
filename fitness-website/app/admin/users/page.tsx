"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Mail, Phone, Calendar, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const initialUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    membership: "Pro",
    status: "active",
    joinDate: "2024-01-15",
    lastLogin: "2024-01-20",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@email.com",
    phone: "+1 (555) 234-5678",
    membership: "Elite",
    status: "active",
    joinDate: "2024-01-10",
    lastLogin: "2024-01-19",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@email.com",
    phone: "+1 (555) 345-6789",
    membership: "Starter",
    status: "inactive",
    joinDate: "2023-12-20",
    lastLogin: "2024-01-05",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah.wilson@email.com",
    phone: "+1 (555) 456-7890",
    membership: "Pro",
    status: "active",
    joinDate: "2024-01-08",
    lastLogin: "2024-01-20",
  },
  {
    id: 5,
    name: "David Brown",
    email: "david.brown@email.com",
    phone: "+1 (555) 567-8901",
    membership: "Elite",
    status: "suspended",
    joinDate: "2023-11-15",
    lastLogin: "2024-01-18",
  },
]

export default function UsersManagement() {
  const [users, setUsers] = useState(initialUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMembership, setSelectedMembership] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const memberships = ["Starter", "Pro", "Elite"]
  const statuses = ["active", "inactive", "suspended"]

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMembership = selectedMembership === "all" || user.membership === selectedMembership
    const matchesStatus = selectedStatus === "all" || user.status === selectedStatus
    return matchesSearch && matchesMembership && matchesStatus
  })

  const handleStatusChange = (userId: number, newStatus: string) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)))
  }

  const getMembershipColor = (membership: string) => {
    switch (membership) {
      case "Starter":
        return "#6C757D"
      case "Pro":
        return "#007BFF"
      case "Elite":
        return "#32CD32"
      default:
        return "#6C757D"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#32CD32"
      case "inactive":
        return "#6C757D"
      case "suspended":
        return "#dc3545"
      default:
        return "#6C757D"
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#212529" }}>
            Users Management
          </h1>
          <p style={{ color: "#6C757D" }}>Manage user accounts and memberships</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: "#6C757D" }}>
                    Total Users
                  </p>
                  <p className="text-2xl font-bold" style={{ color: "#212529" }}>
                    {users.length}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#007BFF", opacity: 0.1 }}
                >
                  <span className="text-2xl" style={{ color: "#007BFF" }}>
                    👥
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: "#6C757D" }}>
                    Active Users
                  </p>
                  <p className="text-2xl font-bold" style={{ color: "#212529" }}>
                    {users.filter((u) => u.status === "active").length}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#32CD32", opacity: 0.1 }}
                >
                  <span className="text-2xl" style={{ color: "#32CD32" }}>
                    ✅
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: "#6C757D" }}>
                    Pro Members
                  </p>
                  <p className="text-2xl font-bold" style={{ color: "#212529" }}>
                    {users.filter((u) => u.membership === "Pro").length}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#007BFF", opacity: 0.1 }}
                >
                  <span className="text-2xl" style={{ color: "#007BFF" }}>
                    ⭐
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: "#6C757D" }}>
                    Elite Members
                  </p>
                  <p className="text-2xl font-bold" style={{ color: "#212529" }}>
                    {users.filter((u) => u.membership === "Elite").length}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#32CD32", opacity: 0.1 }}
                >
                  <span className="text-2xl" style={{ color: "#32CD32" }}>
                    👑
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: "#6C757D" }}
                />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedMembership} onValueChange={setSelectedMembership}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Memberships" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Memberships</SelectItem>
                  {memberships.map((membership) => (
                    <SelectItem key={membership} value={membership}>
                      {membership}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle style={{ color: "#212529" }}>Users ({filteredUsers.length})</CardTitle>
            <CardDescription style={{ color: "#6C757D" }}>Manage user accounts and memberships</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Membership</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                          style={{ backgroundColor: "#007BFF" }}
                        >
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: "#212529" }}>
                            {user.name}
                          </p>
                          <div className="flex items-center text-sm" style={{ color: "#6C757D" }}>
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                          <div className="flex items-center text-sm" style={{ color: "#6C757D" }}>
                            <Phone className="h-3 w-3 mr-1" />
                            {user.phone}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: getMembershipColor(user.membership),
                          color: "#FFFFFF",
                        }}
                      >
                        {user.membership}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: getStatusColor(user.status),
                          color: "#FFFFFF",
                        }}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" style={{ color: "#6C757D" }} />
                        <span className="text-sm" style={{ color: "#6C757D" }}>
                          {user.joinDate}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm" style={{ color: "#6C757D" }}>
                        {user.lastLogin}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(user.id, "active")}
                            disabled={user.status === "active"}
                          >
                            Activate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(user.id, "inactive")}
                            disabled={user.status === "inactive"}
                          >
                            Deactivate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(user.id, "suspended")}
                            disabled={user.status === "suspended"}
                          >
                            Suspend
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

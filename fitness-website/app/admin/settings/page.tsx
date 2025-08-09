"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "react-hot-toast"
import {
  Save,
  Upload,
  Globe,
  Bell,
  Shield,
  Palette,
  Users,
  BookOpen,
  ShoppingCart,
  Eye,
  Check,
  X,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Loader2,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  RefreshCw
} from "lucide-react"

const API_BASE = "http://localhost:8000"

interface TrainingRequest {
  request_id: string
  user_id: string
  name: string
  email: string
  phone: string
  training_goal: string
  training_frequency: string
  status: string
  created_at: string
  end_date: string
  isExpired: string
}

interface CourseRequest {
  request_id: string
  user_id: string
  course_id: string
  name: string
  email: string
  course_title: string
  status: string
  created_at: string
}

interface Order {
  order_id: string
  user_id: string
  customer_name: string
  customer_email: string
  total_amount: string
  status: string
  created_at: string
  items_count: number
}

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: "FitPro",
    siteDescription: "Transform Your Body, Mind & Life",
    contactEmail: "info@fitpro.com",
    contactPhone: "+1 (555) 123-4567",
    address: "123 Fitness Street, Health City, HC 12345",
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    sessionTimeout: "30",
    maxLoginAttempts: "5",
  })

  // Request management states
  const [trainingRequests, setTrainingRequests] = useState<TrainingRequest[]>([])
  const [courseRequests, setCourseRequests] = useState<CourseRequest[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [expiringRequests, setExpiringRequests] = useState<TrainingRequest[]>([])
  
  const [loading, setLoading] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("general")

  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminAuth")
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }

  const showSuccessToast = (message: string) => {
    toast.success(message, {
      duration: 3000,
      style: {
        background: "linear-gradient(135deg, #10b981, #059669)",
        color: "#fff",
        fontWeight: "600",
        borderRadius: "12px",
        padding: "16px 20px",
        boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)",
      },
    })
  }

  const showErrorToast = (message: string) => {
    toast.error(message, {
      duration: 4000,
      style: {
        background: "linear-gradient(135deg, #ef4444, #dc2626)",
        color: "#fff",
        fontWeight: "600",
        borderRadius: "12px",
        padding: "16px 20px",
        boxShadow: "0 10px 25px rgba(239, 68, 68, 0.3)",
      },
    })
  }

  // Fetch all requests data
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchTrainingRequests(),
        fetchCourseRequests(),
        fetchOrders(),
        fetchExpiringRequests()
      ])
    } catch (error) {
      console.error("Error fetching data:", error)
      showErrorToast("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const fetchTrainingRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/AdminTrainingRequests/getAll`, {
        headers: getAuthHeaders(),
      })
      const data = await res.json()
      if (res.ok) {
        setTrainingRequests(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching training requests:", error)
    }
  }

  const fetchCourseRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/AdminCoursesRequests/getAll`, {
        headers: getAuthHeaders(),
      })
      const data = await res.json()
      if (res.ok) {
        setCourseRequests(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching course requests:", error)
    }
  }

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/AdminOrders/getAll`, {
        headers: getAuthHeaders(),
      })
      const data = await res.json()
      if (res.ok) {
        setOrders(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
  }

  const fetchExpiringRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/AdminTrainingRequests/getExpirationSoon`, {
        headers: getAuthHeaders(),
      })
      const data = await res.json()
      if (res.ok) {
        setExpiringRequests(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching expiring requests:", error)
    }
  }

  const handleRequestAction = async (type: 'training' | 'course' | 'order', action: 'approve' | 'cancel' | 'delete', id: string) => {
    try {
      let endpoint = ""
      let method = ""

      switch (type) {
        case 'training':
          endpoint = `AdminTrainingRequests/${action}/${id}`
          method = action === 'delete' ? 'DELETE' : 'PUT'
          break
        case 'course':
          endpoint = `AdminCoursesRequests/${action}/${id}`
          method = action === 'delete' ? 'DELETE' : 'PUT'
          break
        case 'order':
          endpoint = `AdminOrders/${action}/${id}`
          method = action === 'delete' ? 'DELETE' : 'PUT'
          break
      }

      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method,
        headers: getAuthHeaders(),
      })

      const data = await res.json()
      if (res.ok) {
        showSuccessToast(`${type} request ${action}d successfully!`)
        fetchAllData() // Refresh all data
      } else {
        showErrorToast(data.message || `Failed to ${action} ${type} request`)
      }
    } catch (error) {
      console.error(`Error ${action}ing ${type} request:`, error)
      showErrorToast(`Network error while ${action}ing ${type} request`)
    }
  }

  const showRequestDetails = async (type: 'training' | 'course', id: string) => {
    try {
      const endpoint = type === 'training' 
        ? `AdminTrainingRequests/showDetails/${id}`
        : `AdminCoursesRequests/showDetails/${id}`
      
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        headers: getAuthHeaders(),
      })
      const data = await res.json()
      if (res.ok) {
        setSelectedRequest(data.data)
        setShowDetailsModal(true)
      } else {
        showErrorToast("Failed to load request details")
      }
    } catch (error) {
      console.error("Error fetching request details:", error)
      showErrorToast("Network error while loading details")
    }
  }

  const handleSave = (section: string) => {
    showSuccessToast(`${section} settings saved successfully!`)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredTrainingRequests = trainingRequests.filter(request => {
    const matchesSearch = request.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredCourseRequests = courseRequests.filter(request => {
    const matchesSearch = request.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <div className="text-lg text-gray-600">Loading settings...</div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              Admin Settings & Requests
            </h1>
            <p className="text-gray-600 mt-2">
              Manage system settings and handle user requests
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              {trainingRequests.length} Training Requests
            </Badge>
            <Badge variant="outline" className="text-sm">
              {courseRequests.length} Course Requests
            </Badge>
            <Badge className="bg-green-100 text-green-800 text-sm">
              {orders.length} Orders
            </Badge>
            {expiringRequests.length > 0 && (
              <Badge className="bg-red-100 text-red-800 text-sm animate-pulse">
                {expiringRequests.length} Expiring Soon
              </Badge>
            )}
          </div>
        </div>

        {/* Expiring Requests Alert */}
        {expiringRequests.length > 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="flex items-center justify-between">
                <span>
                  <strong>{expiringRequests.length} training requests</strong> are expiring within 2 days!
                </span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setActiveTab("training-requests")}
                  className="ml-4"
                >
                  View Details
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-gray-100">
            <TabsTrigger value="general" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="training-requests" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Training</span>
            </TabsTrigger>
            <TabsTrigger value="course-requests" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Courses</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>Orders</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Globe className="h-6 w-6 text-blue-600" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Basic site configuration and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => handleInputChange("siteName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => handleInputChange("siteDescription", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      value={settings.contactPhone}
                      onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={settings.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave("general")} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Requests */}
          <TabsContent value="training-requests">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-green-600" />
                    <CardTitle className="text-xl">Training Requests Management</CardTitle>
                  </div>
                  <Button onClick={fetchTrainingRequests} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                <CardDescription>
                  Manage personal training requests from users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filter */}
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Training Requests Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Goal</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTrainingRequests.map((request) => (
                        <TableRow key={request.request_id} className="hover:bg-gray-50">
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{request.name}</div>
                              <div className="text-sm text-gray-500">{request.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">{request.training_goal}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{request.training_frequency}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                            {request.isExpired === "1" && (
                              <Badge className="bg-red-100 text-red-800 ml-1">Expired</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">{formatDate(request.created_at)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {request.end_date && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span className="text-sm">{formatDate(request.end_date)}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => showRequestDetails('training', request.request_id)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {request.status === "pending" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRequestAction('training', 'approve', request.request_id)}
                                    className="h-8 w-8 p-0 hover:bg-green-50"
                                  >
                                    <Check className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRequestAction('training', 'cancel', request.request_id)}
                                    className="h-8 w-8 p-0 hover:bg-red-50"
                                  >
                                    <X className="h-4 w-4 text-red-600" />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRequestAction('training', 'delete', request.request_id)}
                                className="h-8 w-8 p-0 hover:bg-red-50"
                              >
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Course Requests */}
          <TabsContent value="course-requests">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                    <CardTitle className="text-xl">Course Requests Management</CardTitle>
                  </div>
                  <Button onClick={fetchCourseRequests} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                <CardDescription>
                  Manage course enrollment requests from users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filter */}
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Course Requests Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCourseRequests.map((request) => (
                        <TableRow key={request.request_id} className="hover:bg-gray-50">
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{request.name}</div>
                              <div className="text-sm text-gray-500">{request.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{request.course_title}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">{formatDate(request.created_at)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => showRequestDetails('course', request.request_id)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {request.status === "pending" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRequestAction('course', 'approve', request.request_id)}
                                    className="h-8 w-8 p-0 hover:bg-green-50"
                                  >
                                    <Check className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRequestAction('course', 'cancel', request.request_id)}
                                    className="h-8 w-8 p-0 hover:bg-red-50"
                                  >
                                    <X className="h-4 w-4 text-red-600" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders */}
          <TabsContent value="orders">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="h-6 w-6 text-orange-600" />
                    <CardTitle className="text-xl">Orders Management</CardTitle>
                  </div>
                  <Button onClick={fetchOrders} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                <CardDescription>
                  Manage product orders and transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filter */}
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by customer name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.order_id} className="hover:bg-gray-50">
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{order.customer_name}</div>
                              <div className="text-sm text-gray-500">{order.customer_email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{order.items_count} items</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-green-600">${order.total_amount}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">{formatDate(order.created_at)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {/* Show order details */}}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {order.status === "pending" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRequestAction('order', 'approve', order.order_id)}
                                    className="h-8 w-8 p-0 hover:bg-green-50"
                                  >
                                    <Check className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRequestAction('order', 'cancel', order.order_id)}
                                    className="h-8 w-8 p-0 hover:bg-red-50"
                                  >
                                    <X className="h-4 w-4 text-red-600" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Bell className="h-6 w-6 text-yellow-600" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-gray-600">
                      Receive notifications via SMS
                    </p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => handleInputChange("smsNotifications", checked)}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave("notifications")} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Shield className="h-6 w-6 text-red-600" />
                  Security Settings
                </CardTitle>
                <CardDescription>Configure security and access controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-gray-600">
                      Put the site in maintenance mode
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => handleInputChange("maintenanceMode", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Registration</Label>
                    <p className="text-sm text-gray-600">
                      Allow new users to register
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowRegistration}
                    onCheckedChange={(checked) => handleInputChange("allowRegistration", checked)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Select
                      value={settings.sessionTimeout}
                      onValueChange={(value) => handleInputChange("sessionTimeout", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Select
                      value={settings.maxLoginAttempts}
                      onValueChange={(value) => handleInputChange("maxLoginAttempts", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 attempts</SelectItem>
                        <SelectItem value="5">5 attempts</SelectItem>
                        <SelectItem value="10">10 attempts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave("security")} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Request Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Request Details
              </DialogTitle>
              <DialogDescription>
                Detailed information about the selected request
              </DialogDescription>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-6">
                {/* User Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      User Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{selectedRequest.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{selectedRequest.email}</span>
                      </div>
                      {selectedRequest.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{selectedRequest.phone}</span>
                        </div>
                      )}
                      {selectedRequest.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{selectedRequest.address}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Request Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Request Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedRequest.training_goal && (
                      <div>
                        <Label className="font-medium">Training Goal:</Label>
                        <p className="text-gray-700 mt-1">{selectedRequest.training_goal}</p>
                      </div>
                    )}
                    {selectedRequest.training_frequency && (
                      <div>
                        <Label className="font-medium">Training Frequency:</Label>
                        <Badge variant="outline" className="ml-2">{selectedRequest.training_frequency}</Badge>
                      </div>
                    )}
                    {selectedRequest.course_title && (
                      <div>
                        <Label className="font-medium">Course:</Label>
                        <p className="text-gray-700 mt-1">{selectedRequest.course_title}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-medium">Status:</Label>
                        <Badge className={`${getStatusColor(selectedRequest.status)} ml-2`}>
                          {selectedRequest.status}
                        </Badge>
                      </div>
                      <div>
                        <Label className="font-medium">Created:</Label>
                        <p className="text-gray-700 mt-1">{formatDate(selectedRequest.created_at)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                {selectedRequest.status === "pending" && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => {
                        const type = selectedRequest.training_goal ? 'training' : 'course'
                        handleRequestAction(type, 'approve', selectedRequest.request_id)
                        setShowDetailsModal(false)
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Request
                    </Button>
                    <Button
                      onClick={() => {
                        const type = selectedRequest.training_goal ? 'training' : 'course'
                        handleRequestAction(type, 'cancel', selectedRequest.request_id)
                        setShowDetailsModal(false)
                      }}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Request
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
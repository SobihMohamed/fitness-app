"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";
import { API_CONFIG } from "@/config/api";
import axios from "axios";
import { Dumbbell, Clock, CheckCircle, XCircle, Loader2, Plus } from "lucide-react";
import { format } from "date-fns";

interface TrainingRequest {
  start_date?: string;
  end_date?: string;
  injury_details?: string;
  goal_description?: string;
  age?: number;
  training_per_week?: number;
  diseases_details?: string;
  weight?: number;
  height?: number;
  training_place?: string;
  user_id?: string;
  status?: "pending" | "approved" | "cancelled";
  created_at?: string;
}

export default function TrainingRequestsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("new-request");
  const [requests, setRequests] = useState<TrainingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    injury_details: "",
    goal_description: "",
    age: "",
    training_per_week: "",
    diseases_details: "",
    weight: "",
    height: "",
    training_place: "",
  });

  // Fetch user's training requests
  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      
      if (!token) {
        toast.error("Authentication required");
        setIsLoading(false);
        return;
      }

      const response = await axios.post(
        API_CONFIG.USER_FUNCTIONS.RequestForTraining.getAllMyRequests,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.data) {
        setRequests(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching training requests:", error);
      if (error.response) {
        toast.error(`Failed to load requests: ${error.response.data?.message || 'Unknown error'}`);
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Failed to load training requests");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.age) {
      toast.error("Please fill in your age");
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      toast.error("Please specify start and end dates for your training");
      return;
    }

    if (!formData.training_per_week || !formData.training_place) {
      toast.error("Please specify training frequency and location");
      return;
    }

    if (!formData.weight || !formData.height) {
      toast.error("Please specify your weight and height");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      
      if (!token) {
        toast.error("Authentication required");
        setIsSubmitting(false);
        return;
      }

      // Prepare data for submission (convert string numbers to actual numbers)
      const submissionData = {
        age: parseInt(formData.age as string, 10),
        start_date: formData.start_date,
        end_date: formData.end_date,
        training_per_week: parseInt(formData.training_per_week as string, 10),
        training_place: formData.training_place,
        weight: parseFloat(formData.weight as string),
        height: parseFloat(formData.height as string),
        injury_details: formData.injury_details,
        diseases_details: formData.diseases_details,
        goal_description: formData.goal_description,
      };

      const response = await axios.post(
        API_CONFIG.USER_FUNCTIONS.RequestForTraining.createRequestToAdmin,
        submissionData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.status === "success") {
        toast.success("Training request submitted successfully");
        // Reset form
        setFormData({
          start_date: "",
          end_date: "",
          injury_details: "",
          goal_description: "",
          age: "",
          training_per_week: "",
          diseases_details: "",
          weight: "",
          height: "",
          training_place: "",
        });
        // Refresh requests
        fetchRequests();
        // Switch to history tab
        setActiveTab("request-history");
      }
    } catch (error: any) {
      console.error("Error submitting training request:", error);
      if (error.response) {
        toast.error(`Failed to submit request: ${error.response.data?.message || 'Unknown error'}`);
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Failed to submit training request");
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="w-3 h-3 mr-1" /> Approved
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <XCircle className="w-3 h-3 mr-1" /> Cancelled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Personal Training Requests
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Request personalized training sessions or view your request history
          </p>
        </div>

        <Tabs
          defaultValue="new-request"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <TabsTrigger
              value="new-request"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400 font-medium rounded-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </TabsTrigger>
            <TabsTrigger
              value="request-history"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400 font-medium rounded-md"
            >
              <Clock className="w-4 h-4 mr-2" />
              Request History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new-request" className="m-0">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    <Dumbbell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Request Personal Training
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Fill out the form below to request a personal training session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information Section */}
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white flex items-center">
                      <span className="inline-block w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full mr-2 flex items-center justify-center">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">1</span>
                      </span>
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="age" className="text-foreground font-medium">
                          Age <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="age"
                          name="age"
                          type="number"
                          value={formData.age}
                          onChange={handleInputChange}
                          placeholder="Enter your age"
                          className="focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weight" className="text-foreground font-medium">
                          Weight (kg) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="weight"
                          name="weight"
                          type="number"
                          step="0.1"
                          value={formData.weight}
                          onChange={handleInputChange}
                          placeholder="Enter your weight"
                          className="focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="height" className="text-foreground font-medium">
                          Height (cm) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="height"
                          name="height"
                          type="number"
                          value={formData.height}
                          onChange={handleInputChange}
                          placeholder="Enter your height"
                          className="focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Training Preferences Section */}
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white flex items-center">
                      <span className="inline-block w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full mr-2 flex items-center justify-center">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">2</span>
                      </span>
                      Training Preferences
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="training_per_week" className="text-foreground font-medium">
                          Training Sessions Per Week <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="training_per_week"
                          name="training_per_week"
                          type="number"
                          value={formData.training_per_week}
                          onChange={handleInputChange}
                          placeholder="Enter number of sessions"
                          className="focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="training_place" className="text-foreground font-medium">
                          Preferred Training Location <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="training_place"
                          name="training_place"
                          value={formData.training_place}
                          onChange={handleInputChange}
                          placeholder="Gym, home, outdoors, etc."
                          className="focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="start_date" className="text-foreground font-medium">
                          Training Start Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="start_date"
                          name="start_date"
                          type="date"
                          value={formData.start_date}
                          onChange={handleInputChange}
                          className="focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="end_date" className="text-foreground font-medium">
                          Training End Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="end_date"
                          name="end_date"
                          type="date"
                          value={formData.end_date}
                          onChange={handleInputChange}
                          className="focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Health Information Section */}
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white flex items-center">
                      <span className="inline-block w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full mr-2 flex items-center justify-center">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">3</span>
                      </span>
                      Health Information
                    </h3>
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="injury_details" className="text-foreground font-medium">
                          Injury Details <span className="text-slate-500 font-normal">(optional)</span>
                        </Label>
                        <Textarea
                          id="injury_details"
                          name="injury_details"
                          value={formData.injury_details}
                          onChange={handleInputChange}
                          placeholder="Please describe any current or past injuries"
                          className="min-h-[100px] focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="diseases_details" className="text-foreground font-medium">
                          Medical Conditions <span className="text-slate-500 font-normal">(optional)</span>
                        </Label>
                        <Textarea
                          id="diseases_details"
                          name="diseases_details"
                          value={formData.diseases_details}
                          onChange={handleInputChange}
                          placeholder="Please describe any medical conditions or diseases"
                          className="min-h-[100px] focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="goal_description" className="text-foreground font-medium">
                          Training Goals <span className="text-slate-500 font-normal">(optional)</span>
                        </Label>
                        <Textarea
                          id="goal_description"
                          name="goal_description"
                          value={formData.goal_description}
                          onChange={handleInputChange}
                          placeholder="Describe your specific training goals and expectations"
                          className="min-h-[100px] focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Training Request"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="request-history" className="m-0">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Your Training Request History
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  View and manage your personal training requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  // Skeleton loader
                  <div className="space-y-4">
                    {Array(3)
                      .fill(0)
                      .map((_, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-4">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-6 w-1/4" />
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                          <div className="flex justify-between items-center mt-4">
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-10 w-1/4" />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                      <Dumbbell className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      No training requests yet
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
                      You haven't submitted any personal training requests. Create a new request to get started.
                    </p>
                    <Button onClick={() => setActiveTab("new-request")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Request
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Request Date</TableHead>
                          <TableHead>Training Period</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {requests.map((request, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-bold text-lg text-indigo-600 bg-indigo-50 rounded-full w-8 h-8 text-center">
                              {index + 1}
                            </TableCell>
                            <TableCell className="font-medium">
                              {request.created_at ? formatDate(request.created_at) : "N/A"}
                            </TableCell>
                            <TableCell>
                              {request.start_date && request.end_date ? 
                                `${formatDate(request.start_date)} - ${formatDate(request.end_date)}` : 
                                "N/A"}
                            </TableCell>
                            <TableCell>{request.status ? getStatusBadge(request.status) : "N/A"}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50">
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

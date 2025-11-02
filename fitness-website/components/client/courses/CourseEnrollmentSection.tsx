"use client";

import React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { formatNumber } from "@/utils/format";
import { useAuth } from "@/contexts/auth-context";
import { API_CONFIG } from "@/config/api";
import { useUserApi } from "@/hooks/client/use-user-api";
import { useCourseRequests } from "@/hooks/client/use-course-requests";

import {
  ShoppingCart,
  Heart,
  Share2,
  CheckCircle,
  Users,
  Eye,
  ExternalLink,
} from "lucide-react";

interface Course {
  course_id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  instructor?: string;
  duration?: string;
  level?: string;
  students_count?: number;
  rating?: number;
  created_at: string;
  modules?: any[];
  is_subscribed?: boolean;
}

interface CourseEnrollmentSectionProps {
  course: Course;
  onEnrollment?: (course: Course) => void;
}

const CourseEnrollmentSection = React.memo<CourseEnrollmentSectionProps>(({ course, onEnrollment }) => {
  const { user } = useAuth();
  const { makeAuthenticatedRequest } = useUserApi();
  const { getCourseRequestStatus, canEnroll, getEnrollmentButtonState, refetch } = useCourseRequests();

  const [isFavorite, setIsFavorite] = React.useState(false);

  // Dialog form state
  const [open, setOpen] = React.useState(false);
  const [gender, setGender] = React.useState("");
  const [job, setJob] = React.useState("");
  const [age, setAge] = React.useState<string>("");
  const [promoCode, setPromoCode] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  // Totals
  const originalTotal = Number(course.price || 0);
  const discountValue = promoCode.trim().toUpperCase() === "DISCOUNT10" ? 10 : 0; // sample rule
  const netTotal = Math.max(0, originalTotal - discountValue);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: course.title, url: window.location.href });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      }
    } catch {}
  };

  // Get current course request status
  const { isSubscribed, status } = getCourseRequestStatus(course.course_id);
  const buttonState = getEnrollmentButtonState(course.course_id);
  const canEnrollInCourse = canEnroll(course.course_id);

  const openEnroll = () => {
    // Check if user can enroll
    if (!canEnrollInCourse) {
      if (status === 'approved') {
        toast.info("You are already enrolled in this course!");
        return;
      } else if (status === 'pending') {
        toast.info("Your enrollment request is pending admin approval.");
        return;
      }
    }
    
    // Open the enrollment dialog
    setOpen(true);
  };

  const handleSubmitRequest = async () => {
    try {
      if (!user) {
        toast.error("Please login to continue");
        return;
      }
      if (!gender || !job || !age) {
        toast.error("Please fill all required fields");
        return;
      }

      setSubmitting(true);

      const payload = {
        course_id: course.course_id,
        gender,
        job,
        age: Number(age),
        promo_code_used: promoCode || null,
        original_total: originalTotal,
        discount_value: discountValue,
        net_total: netTotal,
      };

      const data = await makeAuthenticatedRequest(API_CONFIG.USER_FUNCTIONS.requests.courses.create, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (data?.status === "success") {
        toast.success("Enrollment request submitted!");
        setOpen(false);
        // reset
        setGender("");
        setJob("");
        setAge("");
        setPromoCode("");
        // Refresh the requests to update the UI
        refetch();
      } else {
        throw new Error(data?.message || "Failed to create request");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Price Card */}
      <Card className="border-gray-100 shadow-lg sticky top-24">
        <CardHeader className="text-center pb-4">
          <div className="text-4xl font-bold text-foreground mb-2">
            {formatNumber(course.price)} EGP
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Best Value
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Enroll Now */}
          <Button
            onClick={buttonState.disabled ? undefined : openEnroll}
            disabled={buttonState.disabled}
            className={buttonState.className}
            size="lg"
          >
            {buttonState.icon === 'CheckCircle' && <CheckCircle className="w-5 h-5 mr-2" />}
            {buttonState.icon === 'Eye' && <Eye className="w-5 h-5 mr-2" />}
            {buttonState.icon === 'ShoppingCart' && <ShoppingCart className="w-5 h-5 mr-2" />}
            {buttonState.text}
          </Button>

          {/* Status Display */}
          {isSubscribed && (
            <div className="p-3 rounded-lg border text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">Enrollment Status:</span>
                <Badge 
                  variant={status === 'approved' ? 'default' : status === 'pending' ? 'secondary' : 'destructive'}
                  className={
                    status === 'approved' ? 'bg-green-100 text-green-800' :
                    status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }
                >
                  {status === 'approved' ? 'Approved' :
                   status === 'pending' ? 'Pending Review' :
                   status === 'cancelled' ? 'Cancelled' : 'Unknown'}
                </Badge>
              </div>
              {status === 'pending' && (
                <p className="text-muted-foreground mt-2 text-xs">
                  Your enrollment request is being reviewed by our team. You'll be notified once it's approved.
                </p>
              )}
              {status === 'cancelled' && (
                <p className="text-muted-foreground mt-2 text-xs">
                  Your previous request was cancelled. You can submit a new request.
                </p>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`${isFavorite ? "text-red-500 border-red-200" : "text-muted-foreground"}`}
            >
              <Heart className={`w-4 h-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
              {isFavorite ? "Saved" : "Save"}
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          <Separator />

          {/* Quick Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Students Enrolled</span>
              <span className="font-semibold">{formatNumber(course.students_count || 0)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-semibold">{course.duration || "Self-paced"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Level</span>
              <span className="font-semibold">{course.level || "All Levels"}</span>
            </div>
          </div>

          <Separator />

          {/* Money Back */}
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-green-800 mb-1">30-Day Money Back Guarantee</p>
            <p className="text-xs text-green-600">Full refund if you're not satisfied</p>
          </div>
        </CardContent>
      </Card>

      {/* Instructor */}
      {course.instructor && (
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Instructor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{course.instructor}</h4>
                <p className="text-sm text-muted-foreground">Certified Fitness Expert</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enrollment Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Course Enrollment Request</DialogTitle>
            <DialogDescription>
              Complete the form to submit your request for <strong>{course.title}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <Label htmlFor="job">Job</Label>
                <Input
                  id="job"
                  placeholder="Your job (e.g., Software Engineer)"
                  className="mt-1"
                  value={job}
                  onChange={(e) => setJob(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min={1}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="promo">Promo Code</Label>
                <Input
                  id="promo"
                  placeholder="Optional (e.g., DISCOUNT10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-lg border p-3 text-sm">
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Original Total</span>
                <span className="font-semibold">{formatNumber(originalTotal)} EGP</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-semibold">{formatNumber(discountValue)} EGP</span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Net Total</span>
                <span className="font-bold text-primary">{formatNumber(netTotal)} EGP</span>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 flex items-center gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitRequest} disabled={submitting} className="bg-primary text-white">
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

CourseEnrollmentSection.displayName = "CourseEnrollmentSection";

export default CourseEnrollmentSection;
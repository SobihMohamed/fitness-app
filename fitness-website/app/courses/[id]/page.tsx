import React from "react";
import CourseDetailsClientPage from "@/components/client/courses/CourseDetailsClientPage";

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CourseDetailsClientPage courseId={id} />;
}

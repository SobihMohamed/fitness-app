import React from "react";
import BlogPostClientPage from "@/components/client/blogs/BlogPostClientPage";

type ParamsPromise = Promise<{ id: string }>;
type SearchParamsPromise = Promise<{ watch?: string } | undefined>;

export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: ParamsPromise;
  searchParams: SearchParamsPromise;
}) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;

  const id = resolvedParams?.id ?? "";
  const shouldAutoWatch = resolvedSearch?.watch === "1";

  return <BlogPostClientPage blogId={id} shouldAutoWatch={shouldAutoWatch} />;
}

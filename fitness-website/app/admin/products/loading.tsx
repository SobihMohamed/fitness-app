"use client"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-50"></div>
      <p className="ml-4 text-gray-500 text-lg font-medium">Loading products...</p>
    </div>
  )
}
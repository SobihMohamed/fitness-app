"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { LoginModal } from "@/components/auth/login-modal"
import { useState } from "react"


// ProtectedAction component
// This component wraps an action that requires authentication.
// If the user is not authenticated, it shows a login modal.
// If the user is authenticated, it executes the provided action when the children element is clicked.
interface ProtectedActionProps {
  children: React.ReactNode
  onAction: () => void
  requireAuth?: boolean
}

// ProtectedAction component
// This component allows you to wrap any action that requires authentication.
// If the user is not authenticated, it will show a login modal when the action is triggered.
// If the user is authenticated, it will execute the provided action directly.
export function ProtectedAction({ children, onAction, requireAuth = true }: ProtectedActionProps) {
  const { user } = useAuth()
  const [showLogin, setShowLogin] = useState(false)

  // Handle click event
  // If authentication is required and the user is not logged in,
  // show the login modal. Otherwise, execute the provided action.
  // This allows for protected actions that can be triggered by clicking on the children element.
  const handleClick = () => {
    if (requireAuth && !user) {
      setShowLogin(true)
    } else {
      onAction()
    }
  }

  return (
    <>
      <div onClick={handleClick} className="cursor-pointer">
        {children}
      </div>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  )
}

// Keep the original ProtectedRoute for pages that need full protection
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600">Please sign in to access this page</p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

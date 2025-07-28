"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { LoginModal } from "@/components/auth/login-modal";
import { UserMenu } from "@/components/auth/user-menu";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/auth-context";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Products", href: "/products" },
  { name: "Courses", href: "/courses" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const adminToken = localStorage.getItem("adminAuth");
      const userToken = localStorage.getItem("userAuth");

      if (adminToken) {
        setShowNavbar(false); // إخفاء للـ Admin
      } else {
        setShowNavbar(true); // إظهار للـ User أو اللي مش مسجل
      }
    }
  }, []);

  const isLoggedIn = !!user && user.role !== "admin";

  if (!showNavbar) return null;

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
          {/* Logo يظهر دائمًا */}
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="text-2xl font-bold text-blue-600">FitPro</span>
            </Link>
          </div>

          {/* Menu Button للموبايل */}
          <div className="flex lg:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="-m-2.5 p-2.5">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-full sm:max-w-sm">
                <div className="flex items-center justify-between">
                  <Link href="/" className="-m-1.5 p-1.5">
                    <span className="text-2xl font-bold text-blue-600">
                      FitPro
                    </span>
                  </Link>
                </div>

                {/* روابط التنقل لو المستخدم مش Admin */}
                {isLoggedIn && (
                  <div className="mt-6 flow-root">
                    <div className="-my-6 divide-y divide-gray-500/10">
                      <div className="space-y-2 py-6">
                        {navigation.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`block rounded-lg px-3 py-2 text-base font-semibold leading-7 ${
                              pathname === item.href
                                ? "text-blue-600 bg-gray-100"
                                : "text-gray-900 hover:bg-gray-50"
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                      <div className="py-6 flex justify-center gap-4">
                        <CartDrawer />
                        <UserMenu />
                      </div>
                    </div>
                  </div>
                )}

                {/* زر الدخول لو المستخدم غير مسجل */}
                {!user && (
                  <div className="mt-6 flex justify-center">
                    <Button
                      onClick={() => {
                        setLoginOpen(true);
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign In
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>

          {/* روابط التنقل على ديسكتوب */}
          <div className="hidden lg:flex lg:gap-x-12">
            {isLoggedIn &&
              navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-semibold leading-6 ${
                    pathname === item.href
                      ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                      : "text-gray-900 hover:text-blue-600"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
          </div>

          {/* UserMenu أو زر الدخول */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-4">
            <CartDrawer />
            {user ? (
              <UserMenu />
            ) : (
              <Button onClick={() => setLoginOpen(true)} size="sm">
                Sign In
              </Button>
            )}
          </div>
        </nav>
      </header>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

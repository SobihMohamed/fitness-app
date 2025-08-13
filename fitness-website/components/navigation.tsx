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


const navigationLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Products", href: "/products" },
  { name: "Courses", href: "/courses" },
  { name: "Training Requests", href: "/training-requests" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

const NavLinks = ({
  pathname,
  isMobile = false,
  onLinkClick,
}: {
  pathname: string;
  isMobile?: boolean;
  onLinkClick?: () => void;
}) => (
  <>
    {navigationLinks.map((item) => (
      <Link
        key={item.name}
        href={item.href}
        className={
          isMobile
            ? `block rounded-lg px-3 py-2 text-base font-semibold leading-7 ${
                pathname === item.href
                  ? "text-blue-600 bg-gray-100"
                  : "text-gray-900 hover:bg-gray-50"
              }`
            : `text-sm font-semibold leading-6 transition-colors ${
                pathname === item.href
                  ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                  : "text-gray-900 hover:text-blue-600"
              }`
        }
        onClick={onLinkClick}
      >
        {item.name}
      </Link>
    ))}
  </>
);


const UserActions = () => (
  <div className="flex items-center gap-4">
    <CartDrawer />
    <UserMenu />
  </div>
);


export function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const isAuthenticated = !!user;

  const isAdminPage = pathname.startsWith("/admin");

  useEffect(() => {
    const handler = () => setLoginOpen(true);
    window.addEventListener("open-login-modal", handler);
    return () => window.removeEventListener("open-login-modal", handler);
  }, []);

  if (isAdminPage) {
    return null;
  }

  const openLoginModal = () => {
    setLoginOpen(true);
    setMobileMenuOpen(false); 
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
          {/* Logo */}
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="text-2xl font-bold text-blue-600">FitPro</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:gap-x-12">
            {isAuthenticated && <NavLinks pathname={pathname} />}
          </div>

          {/* Right side actions (Desktop) */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            {isAuthenticated ? (
              <UserActions />
            ) : (
              <Button onClick={openLoginModal} size="sm">
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Trigger */}
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
                <div className="mt-6 flow-root">
                  <div className="-my-6 divide-y divide-gray-500/10">
                    {isAuthenticated ? (
                      <>
                        <div className="space-y-2 py-6">
                          <NavLinks
                            pathname={pathname}
                            isMobile
                            onLinkClick={() => setMobileMenuOpen(false)}
                          />
                        </div>
                        <div className="py-6">
                          <UserActions />
                        </div>
                      </>
                    ) : (
                      <div className="py-6">
                        <Button className="w-full" onClick={openLoginModal}>
                          Sign In
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

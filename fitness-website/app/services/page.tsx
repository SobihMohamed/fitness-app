import React from "react";
import { Check } from "lucide-react";
import ServicesHero from "@/components/client/services/ServicesHero";
import { API_CONFIG } from "@/config/api";
import { normalizeService } from "@/lib/api/normalizers";

// Import Client Wrapper
import { ServicesClientPage } from "@/components/client/services/ServicesClientPage";

export const dynamic = "force-dynamic";

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export default async function ServicesPage() {
  // Preload services on the server to avoid client-side spinners
  const servicesRes = await fetch(API_CONFIG.USER_FUNCTIONS.services.getAll, {
    cache: "no-store",
  });

  const servicesJson = await safeJson(servicesRes);
  const rawServices = Array.isArray(servicesJson)
    ? servicesJson
    : servicesJson?.data || servicesJson?.services || [];
  const initialServices = Array.isArray(rawServices)
    ? rawServices.map((s: Record<string, any>) => normalizeService(s))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <ServicesHero />

      {/* Client-side logic */}
      <ServicesClientPage initialServices={initialServices} />

      {/* Why Choose Us - Static Content, kept server-side to reduce JS */}
      <section
        id="why-us"
        className="py-16 bg-white"
        aria-labelledby="why-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="why-heading" className="sr-only">
            Why Choose Us
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border bg-card shadow-sm">
              <div className="text-primary mb-3">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                Certified Coaches
              </h3>
              <p className="text-muted-foreground">
                Train with experienced, certified professionals who tailor
                programs to your goals and fitness level.
              </p>
            </div>
            <div className="p-6 rounded-xl border bg-card shadow-sm">
              <div className="text-primary mb-3">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                Flexible Schedule
              </h3>
              <p className="text-muted-foreground">
                Choose from a variety of class times and personal training slots
                to fit your busy lifestyle.
              </p>
            </div>
            <div className="p-6 rounded-xl border bg-card shadow-sm">
              <div className="text-primary mb-3">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                Modern Facilities
              </h3>
              <p className="text-muted-foreground">
                Access state-of-the-art equipment and clean, spacious workout
                areas designed for optimal performance.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

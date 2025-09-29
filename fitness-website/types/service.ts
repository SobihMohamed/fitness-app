// Service-related types for the fitness app

// Admin/raw service as returned by backend (admin endpoints)
export interface Service {
  service_id: string;
  title: string;
  details: string;
  duration: string;
  price: string | number;
  picture: string | null;
  created_at?: string;
  admin_id?: string;
}

// Normalized client-facing service used on public pages
export interface ClientService {
  id: number;
  title: string;
  description: string;
  price: number;
  duration: string;
  image?: string | null;
  popular?: boolean;
  features?: string[];
  category?: string;
  created_at?: string;
}

export interface ServiceFeature {
  id: string;
  label: string;
  icon?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
}

export interface ServiceFormData {
  title: string;
  details: string;
  duration: string;
  price: string;
  picture: File | null;
}

export interface ServiceApiResponse {
  data?: Service[] | { data: Service[] };
  services?: Service[];
  message?: string;
  success?: boolean;
}

export interface ServicesPublicApiResponse {
  data?: unknown;
  services?: unknown;
  message?: string;
  success?: boolean;
}

export interface ServiceDeleteTarget {
  id: string;
  name: string;
}

export interface ServiceStats {
  totalServices: number;
  totalPrice: number;
}

// Booking form data used on client-facing service details page
export interface BookingFormData {
  startDate: string;
  goalDescription: string;
  injuryDetails: string;
  diseasesDetails: string;
  age: string;
  trainingPerWeek: string;
  weight: string;
  height: string;
  trainingPlace: string;
}

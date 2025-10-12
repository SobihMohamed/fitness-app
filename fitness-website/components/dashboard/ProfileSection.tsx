"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, ExternalLink, Loader2 } from "lucide-react";
import { SectionCard } from "./SectionCard";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  user_type: string;
}

interface ProfileSectionProps {
  profile: ProfileData | null;
  isLoading: boolean;
  onSave: (data: ProfileData & { password?: string }) => Promise<void>;
}

export function ProfileSection({ profile, isLoading, onSave }: ProfileSectionProps) {
  const [form, setForm] = useState<ProfileData & { password?: string }>({
    name: profile?.name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
    country: profile?.country || "",
    user_type: profile?.user_type || "",
    password: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof ProfileData | "password", value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const startEditing = () => {
    if (profile) {
      setForm({ ...profile, password: "" });
    }
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (profile) setForm({ ...profile, password: "" });
    setIsEditing(false);
  };

  const saveProfile = async () => {
    try {
      setIsSaving(true);
      await onSave(form);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const headerActions = !isEditing ? (
    <Button variant="outline" size="sm" onClick={startEditing}>
      <ExternalLink className="h-4 w-4 mr-2" />
      Edit
    </Button>
  ) : (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={cancelEditing} disabled={isSaving}>
        Cancel
      </Button>
      <Button size="sm" onClick={saveProfile} disabled={isSaving}>
        {isSaving ? (
          <span className="flex items-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
            Saving...
          </span>
        ) : (
          <span>Save</span>
        )}
      </Button>
    </div>
  );

  return (
    <SectionCard
      title="Profile"
      icon={User}
      iconColor="text-blue-600"
      isLoading={isLoading}
      headerActions={headerActions}
    >
      {profile ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Name</p>
            <Input
              value={form.name}
              disabled={!isEditing}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Your name"
              className="transition-colors duration-200"
            />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Email</p>
            <Input
              type="email"
              value={form.email}
              disabled={!isEditing}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Your email"
              className="transition-colors duration-200"
            />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Password</p>
            <Input
              type="password"
              value={form.password || ""}
              disabled={!isEditing}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="Leave empty to keep current password"
              className="transition-colors duration-200"
            />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Phone</p>
            <Input
              value={form.phone}
              disabled={!isEditing}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="Your phone"
              className="transition-colors duration-200"
            />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Address</p>
            <Input
              value={form.address}
              disabled={!isEditing}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Your address"
              className="transition-colors duration-200"
            />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Country</p>
            <Input
              value={form.country}
              disabled={!isEditing}
              onChange={(e) => handleChange("country", e.target.value)}
              placeholder="Your country"
              className="transition-colors duration-200"
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Profile information not available</p>
        </div>
      )}
    </SectionCard>
  );
}

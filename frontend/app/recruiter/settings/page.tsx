"use client";

import { useState, useEffect } from "react";
import { UserIcon, Mail, Building2, Briefcase, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/services/api";
import { useAuthStore } from "@/store/auth-store";

export default function RecruiterSettings() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    title: "",
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await api.get("/settings/recruiter");
        const data = res.data;
        setFormData({
          name: data.name || "",
          company: data.company || "",
          title: data.title || "",
        });
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put("/settings/recruiter", formData);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold tracking-tight">Recruiter Profile</h1>
        <p className="text-muted-foreground text-[14px]">Update your company details and personal information.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-8">
        <h2 className="text-lg font-medium">Company & Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input 
                className="pl-9" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9 bg-muted" value={user?.email || ""} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Company Name</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input 
                className="pl-9" 
                placeholder="e.g. Acme Corp"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Job Title</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input 
                className="pl-9" 
                placeholder="e.g. Senior Technical Recruiter"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
          </div>
        </div>
        
        <div className="pt-4 flex justify-end border-t border-border">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Profile
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { UserIcon, Mail, Phone, Briefcase, Award, Upload, FileText, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/services/api";
import { useAuthStore } from "@/store/auth-store";

export default function CandidateSettings() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    position: "",
    skills: "",
    experience_years: "",
  });
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await api.get("/settings/candidate");
        const data = res.data;
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          position: data.position || "",
          skills: data.skills ? data.skills.join(", ") : "",
          experience_years: data.experience_years?.toString() || "",
        });
        setResumeUrl(data.resume_url);
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
      const payload = {
        ...formData,
        skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
      };
      await api.put("/settings/candidate", payload);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    setIsUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await api.post("/settings/candidate/resume", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResumeUrl(res.data.resume_url);
      toast.success("Resume uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload resume");
    } finally {
      setIsUploading(false);
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
        <h1 className="text-[28px] font-semibold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground text-[14px]">Update your personal information and resume.</p>
      </div>

      <div className="space-y-8">
        {/* Personal Info */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-6">Personal Information</h2>
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
              <Label>Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  className="pl-9" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target Position</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  className="pl-9" 
                  placeholder="e.g. Frontend Developer"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Years of Experience</Label>
              <div className="relative">
                <Award className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  className="pl-9" 
                  type="number"
                  min="0"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label>Skills (Comma separated)</Label>
              <Input 
                placeholder="e.g. React, TypeScript, Node.js"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Profile
            </Button>
          </div>
        </div>

        {/* Resume Upload */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-2">Resume</h2>
          <p className="text-[13px] text-muted-foreground mb-6">Upload your latest resume (PDF only) for recruiters to review.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {resumeUrl ? (
              <div className="flex items-center gap-4 bg-muted/50 border border-border px-4 py-3 rounded-lg flex-1 w-full overflow-hidden">
                <FileText className="w-8 h-8 text-rose-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium truncate">Current Resume.pdf</p>
                  <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-[12px] text-primary hover:underline truncate block">
                    View Document
                  </a>
                </div>
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="shrink-0">
                  Replace
                </Button>
              </div>
            ) : (
              <div className="flex-1 w-full border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center bg-muted/20">
                <Upload className="w-8 h-8 text-muted-foreground mb-3" />
                <p className="text-[14px] font-medium mb-1">No resume uploaded</p>
                <p className="text-[12px] text-muted-foreground mb-4">Click below to upload your PDF resume.</p>
                <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                  {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  Upload PDF
                </Button>
              </div>
            )}
            
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

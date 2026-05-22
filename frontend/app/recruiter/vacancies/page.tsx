"use client";

import { useEffect, useState } from "react";
import { PlusCircle, Building, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/services/api";
import { toast } from "sonner";

interface Vacancy {
  id: string;
  title: string;
  company: string;
  location: string | null;
  description: string | null;
  max_slots: number | null;
  deadline: string | null;
  is_active: boolean;
  created_at: string;
}

export default function VacanciesPage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", company: "", location: "", description: "", max_slots: "", deadline: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVacancies = async () => {
    try {
      const res = await api.get("/vacancies/me");
      setVacancies(res.data);
    } catch (err) {
      toast.error("Failed to fetch vacancies");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVacancies();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        max_slots: form.max_slots ? parseInt(form.max_slots) : null,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      };
      await api.post("/vacancies", payload);
      toast.success("Vacancy created successfully");
      setShowCreate(false);
      setForm({ title: "", company: "", location: "", description: "", max_slots: "", deadline: "" });
      fetchVacancies();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create vacancy");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = async (id: string) => {
    try {
      await api.patch(`/vacancies/${id}/close`);
      toast.success("Vacancy closed");
      fetchVacancies();
    } catch (err) {
      toast.error("Failed to close vacancy");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vacancy?")) return;
    try {
      await api.delete(`/vacancies/${id}`);
      toast.success("Vacancy deleted");
      fetchVacancies();
    } catch (err) {
      toast.error("Failed to delete vacancy");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight">Vacancies</h1>
          <p className="text-[14px] text-muted-foreground mt-1">Manage open positions and track candidates.</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Create Vacancy
        </Button>
      </div>

      {showCreate && (
        <div className="bg-card border border-border p-6 rounded-xl mb-8 relative">
          <Button variant="ghost" size="sm" className="absolute top-4 right-4 h-8 w-8 p-0" onClick={() => setShowCreate(false)}>
            <X className="w-4 h-4" />
          </Button>
          <h2 className="text-[16px] font-semibold mb-4">Create New Vacancy</h2>
          <form onSubmit={handleCreate} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[13px] font-medium">Job Title</label>
                <Input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Senior Frontend Engineer" />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-medium">Company Name</label>
                <Input required value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="e.g. Acme Corp" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[13px] font-medium">Location</label>
                <Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g. Remote, San Francisco" />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-medium">Max Slots (Optional)</label>
                <Input type="number" min="1" value={form.max_slots} onChange={e => setForm({...form, max_slots: e.target.value})} placeholder="e.g. 5" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-medium">Deadline (Optional)</label>
              <Input type="datetime-local" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-medium">Description</label>
              <textarea 
                className="w-full min-h-[100px] flex rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                placeholder="Brief description of the role..."
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Save Vacancy"}
            </Button>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-72" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-20 rounded-md" />
                <Skeleton className="h-9 w-20 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : vacancies.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <Building className="w-8 h-8 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-[16px] font-medium mb-1">No vacancies yet</h3>
          <p className="text-[14px] text-muted-foreground">Create your first vacancy to start receiving AI-interviewed candidates.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {vacancies.map((vacancy) => (
            <div key={vacancy.id} className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-[16px] font-semibold">{vacancy.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${vacancy.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                    {vacancy.is_active ? 'Active' : 'Closed'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[13px] text-muted-foreground mt-2">
                  <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> {vacancy.company}</span>
                  {vacancy.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {vacancy.location}</span>}
                  <span>Posted {new Date(vacancy.created_at).toLocaleDateString()}</span>
                  {vacancy.max_slots && <span>• {vacancy.max_slots} Slots</span>}
                  {vacancy.deadline && <span className="text-amber-600 dark:text-amber-400">• Due {new Date(vacancy.deadline).toLocaleDateString()}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 sm:mt-0">
                {vacancy.is_active && (
                  <Button variant="outline" size="sm" onClick={() => handleClose(vacancy.id)}>
                    Close
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(vacancy.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

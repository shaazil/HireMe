"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Building, MapPin, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Vacancy {
  id: string;
  title: string;
  company: string;
  location: string | null;
  description: string | null;
  max_slots: number | null;
  deadline: string | null;
  created_at: string;
}

export default function JobBoardPage() {
  const router = useRouter();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);

  useEffect(() => {
    async function fetchVacancies() {
      try {
        const res = await api.get("/vacancies");
        setVacancies(res.data);
      } catch (err) {
        toast.error("Failed to load vacancies");
      } finally {
        setIsLoading(false);
      }
    }
    fetchVacancies();
  }, []);

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold tracking-tight">Job Board</h1>
        <p className="text-muted-foreground text-[14px]">Find your next role and take the AI interview immediately.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-3 flex-1">
                <Skeleton className="h-5 w-48" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-10 w-32 shrink-0 rounded-md" />
            </div>
          ))}
        </div>
      ) : vacancies.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-[16px] font-medium mb-1">No open positions</h3>
          <p className="text-[14px] text-muted-foreground">Check back later for new opportunities.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {vacancies.map((vacancy) => (
            <div key={vacancy.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-[16px] font-semibold mb-1">{vacancy.title}</h3>
                <div className="flex flex-wrap items-center gap-4 text-[13px] text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> {vacancy.company}</span>
                  {vacancy.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {vacancy.location}</span>}
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(vacancy.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              <Button 
                variant="outline"
                onClick={() => setSelectedVacancy(vacancy)}
                className="shrink-0"
              >
                View Details
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Vacancy Details Modal */}
      {selectedVacancy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-lg border border-border shadow-lg rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{selectedVacancy.title}</h2>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Building className="w-3.5 h-3.5" />
                  {selectedVacancy.company}
                  {selectedVacancy.location && (
                    <>
                      <span>•</span>
                      <MapPin className="w-3.5 h-3.5" />
                      {selectedVacancy.location}
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 text-sm space-y-6">
              {selectedVacancy.description && (
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">Job Description</h3>
                  <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {selectedVacancy.description}
                  </div>
                </div>
              )}
              
              <div className="space-y-3 bg-muted/30 p-4 rounded-lg border border-border">
                {selectedVacancy.max_slots && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Available Slots:</span>
                    <span className="font-medium">{selectedVacancy.max_slots}</span>
                  </div>
                )}
                {selectedVacancy.deadline && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Application Deadline:</span>
                    <span className="font-medium text-amber-600 dark:text-amber-400">
                      {new Date(selectedVacancy.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posted Date:</span>
                  <span className="font-medium">{new Date(selectedVacancy.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/10">
              <Button variant="ghost" onClick={() => setSelectedVacancy(null)}>
                Cancel
              </Button>
              <Button onClick={() => router.push(`/dashboard/setup?vacancy_id=${selectedVacancy.id}`)}>
                Apply & Interview Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

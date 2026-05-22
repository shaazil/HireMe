"use client";

import { useEffect, useState } from "react";
import { Users, Briefcase, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/services/api";

export default function RecruiterOverview() {
  const [stats, setStats] = useState({ total_vacancies: 0, candidates: 0, hired: 0, rejected: 0 });
  const [vacancyStats, setVacancyStats] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [candidatesRes, vacanciesRes] = await Promise.all([
          api.get("/recruiter/candidates"),
          api.get("/vacancies/me")
        ]);
        
        const candidates = candidatesRes.data.data;
        const vacancies = vacanciesRes.data;

        setStats({
          total_vacancies: vacancies.length,
          candidates: candidates.length,
          hired: candidates.filter((c: any) => c.application_status === "hired").length,
          rejected: candidates.filter((c: any) => c.application_status === "rejected").length,
        });

        // Group by vacancy
        const grouped = vacancies.map((v: any) => {
          const vCands = candidates.filter((c: any) => c.vacancy_id === v.id);
          return {
            ...v,
            total: vCands.length,
            hired: vCands.filter((c: any) => c.application_status === "hired").length,
            rejected: vCands.filter((c: any) => c.application_status === "rejected").length,
          };
        });

        setVacancyStats(grouped);

      } catch (err) {
        console.error("Failed to load overview stats", err);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold tracking-tight">Overview</h1>
        <p className="text-muted-foreground text-[14px]">Welcome back. Here is a summary of your hiring pipeline.</p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Vacancies</CardTitle>
            <Briefcase className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_vacancies}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Candidates</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.candidates}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hired</CardTitle>
            <Briefcase className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.hired}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            <BarChart3 className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Per Vacancy Stats */}
      <h2 className="text-lg font-semibold mb-4">Pipeline by Vacancy</h2>
      {vacancyStats.length === 0 ? (
        <div className="bg-card border border-border p-8 rounded-xl text-center text-muted-foreground text-sm">
          No vacancies found. Create one to see pipeline stats!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vacancyStats.map(v => (
            <Card key={v.id} className="hover:border-primary/20 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-[16px] leading-tight">{v.title}</CardTitle>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${v.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {v.is_active ? 'Active' : 'Closed'}
                  </span>
                </div>
                <p className="text-[12px] text-muted-foreground">{v.location || 'Remote'}</p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm border-t border-border pt-4 mt-2">
                  <div className="text-center">
                    <p className="text-muted-foreground text-[11px] uppercase tracking-wider mb-1">Total</p>
                    <p className="font-semibold">{v.total}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground text-[11px] uppercase tracking-wider mb-1">Hired</p>
                    <p className="font-semibold text-emerald-600">{v.hired}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground text-[11px] uppercase tracking-wider mb-1">Rejected</p>
                    <p className="font-semibold text-red-600">{v.rejected}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

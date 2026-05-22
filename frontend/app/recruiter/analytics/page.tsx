"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Users, TrendingUp, Target, Award } from "lucide-react";

const mockPerformanceData = [
  { name: "Mon", score: 3.2 },
  { name: "Tue", score: 3.8 },
  { name: "Wed", score: 3.5 },
  { name: "Thu", score: 4.1 },
  { name: "Fri", score: 4.0 },
  { name: "Sat", score: 4.5 },
  { name: "Sun", score: 4.2 },
];

const mockRoleDistribution = [
  { role: "Frontend", count: 24 },
  { role: "Backend", count: 18 },
  { role: "Fullstack", count: 32 },
  { role: "Data Sci", count: 12 },
  { role: "Product", count: 8 },
];

export default function AnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold tracking-tight">Analytics Overview</h1>
        <p className="text-muted-foreground text-[14px]">Platform-wide hiring metrics and candidate performance.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Candidates", value: "94", icon: Users },
          { label: "Average Score", value: "3.8", icon: Target },
          { label: "Pass Rate", value: "62%", icon: Award },
          { label: "Interviews/Week", value: "+14%", icon: TrendingUp },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-medium text-muted-foreground">{stat.label}</span>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-semibold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Line Chart */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-[14px] font-semibold mb-6">Average Scores (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} domain={[0, 5]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-[14px] font-semibold mb-6">Candidates by Role</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockRoleDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="role" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, Users, Target, Filter } from "lucide-react";

const scoreTrend = [
  { week: "W1", score: 3.2 },
  { week: "W2", score: 3.5 },
  { week: "W3", score: 3.8 },
  { week: "W4", score: 4.0 },
  { week: "W5", score: 3.9 },
  { week: "W6", score: 4.2 },
];

const funnelData = [
  { stage: "Applied", value: 94 },
  { stage: "Interviewed", value: 68 },
  { stage: "Coding done", value: 52 },
  { stage: "Reviewed", value: 38 },
  { stage: "Hired", value: 12 },
];

const recommendationMix = [
  { name: "Strong hire", value: 18, color: "#059669" },
  { name: "Hire", value: 24, color: "#3f3f46" },
  { name: "Maybe", value: 32, color: "#d97706" },
  { name: "Pass", value: 20, color: "#a1a1aa" },
];

const rankings = [
  { rank: 1, name: "Priya Patel", role: "Frontend", interview: 4.4, coding: 4.6, overall: 4.5 },
  { rank: 2, name: "Marcus Chen", role: "Backend", interview: 4.0, coding: 4.2, overall: 4.1 },
  { rank: 3, name: "Sofia Kim", role: "Full Stack", interview: 3.8, coding: 3.9, overall: 3.85 },
  { rank: 4, name: "Alex Rivera", role: "Frontend", interview: 3.2, coding: 3.5, overall: 3.35 },
];

const chartTooltipStyle = {
  borderRadius: "8px",
  border: "1px solid #e7e5e4",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  fontSize: "12px",
};

export function AnalyticsShowcase() {
  return (
    <section id="analytics" className="py-24 sm:py-32 border-t border-stone-200/80 bg-white">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="max-w-2xl mb-12 sm:mb-16">
          <p className="text-[12px] font-medium text-zinc-400 uppercase tracking-widest mb-3">
            Recruiter analytics
          </p>
          <h2 className="text-[30px] sm:text-[36px] font-semibold tracking-tight text-zinc-900">
            See your entire hiring pipeline at a glance
          </h2>
          <p className="mt-4 text-[15px] text-zinc-500 leading-relaxed">
            Rankings, funnel conversion, score trends, and recommendation breakdowns —
            the metrics you need before extending an offer.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-stone-200 bg-[#fafaf9] p-4 sm:p-6 shadow-[0_8px_40px_rgb(0,0,0,0.05)]"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {[
              { label: "Candidates screened", value: "94", icon: Users },
              { label: "Avg. overall score", value: "3.8", icon: Target },
              { label: "Completion rate", value: "72%", icon: TrendingUp },
              { label: "Active vacancies", value: "6", icon: Filter },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-stone-200/90 bg-white p-4 shadow-sm"
              >
                <s.icon className="w-4 h-4 text-zinc-400 mb-2" />
                <p className="text-[11px] text-zinc-500">{s.label}</p>
                <p className="text-[22px] font-semibold text-zinc-900 mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-12 gap-4 sm:gap-5">
            <div className="lg:col-span-7 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
              <h3 className="text-[13px] font-semibold text-zinc-900 mb-4">
                Average scores over time
              </h3>
              <div className="h-[220px] sm:h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scoreTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                    <XAxis
                      dataKey="week"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#a1a1aa" }}
                    />
                    <YAxis
                      domain={[2.5, 5]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#a1a1aa" }}
                    />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#27272a"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#27272a" }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
              <h3 className="text-[13px] font-semibold text-zinc-900 mb-4">
                Hiring recommendations
              </h3>
              <div className="h-[220px] sm:h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={recommendationMix}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {recommendationMix.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {recommendationMix.map((r) => (
                  <span key={r.name} className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: r.color }}
                    />
                    {r.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
              <h3 className="text-[13px] font-semibold text-zinc-900 mb-4">
                Hiring funnel
              </h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical" margin={{ left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f4" />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="stage"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#71717a" }}
                      width={90}
                    />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="value" fill="#3f3f46" radius={[0, 4, 4, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-stone-100 flex justify-between items-center">
                <h3 className="text-[13px] font-semibold text-zinc-900">
                  Candidate rankings
                </h3>
                <span className="text-[11px] text-zinc-400">Frontend Engineer · Meta</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-stone-100 text-zinc-400">
                      <th className="px-5 py-2.5 font-medium w-10">#</th>
                      <th className="px-3 py-2.5 font-medium">Candidate</th>
                      <th className="px-3 py-2.5 font-medium hidden sm:table-cell">Interview</th>
                      <th className="px-3 py-2.5 font-medium hidden sm:table-cell">Coding</th>
                      <th className="px-5 py-2.5 font-medium text-right">Overall</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.map((r) => (
                      <tr
                        key={r.name}
                        className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50"
                      >
                        <td className="px-5 py-3 font-mono text-zinc-400">{r.rank}</td>
                        <td className="px-3 py-3">
                          <p className="font-medium text-zinc-900">{r.name}</p>
                          <p className="text-[11px] text-zinc-400">{r.role}</p>
                        </td>
                        <td className="px-3 py-3 hidden sm:table-cell tabular-nums">
                          {r.interview}
                        </td>
                        <td className="px-3 py-3 hidden sm:table-cell tabular-nums">
                          {r.coding}
                        </td>
                        <td className="px-5 py-3 text-right font-semibold tabular-nums text-zinc-900">
                          {r.overall}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

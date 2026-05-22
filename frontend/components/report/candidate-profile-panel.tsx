"use client";

import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Clock,
  FileText,
} from "lucide-react";

export interface CandidateProfileData {
  candidate_name: string | null;
  candidate_email?: string | null;
  candidate_phone?: string | null;
  candidate_position?: string | null;
  role_applied?: string | null;
  experience_years?: number | null;
  skills?: string[] | null;
  resume_text?: string | null;
  resume_filename?: string | null;
  vacancy_title?: string | null;
  vacancy_company?: string | null;
}

interface CandidateProfilePanelProps {
  profile: CandidateProfileData;
  showResume?: boolean;
}

function ProfileField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-0.5">
          {label}
        </p>
        <p className="text-[13px] font-medium break-words">{value}</p>
      </div>
    </div>
  );
}

export function CandidateProfilePanel({
  profile,
  showResume = true,
}: CandidateProfilePanelProps) {
  const initials = (profile.candidate_name || "C")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const hasResume = Boolean(profile.resume_text?.trim());

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-[18px] font-semibold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="text-[18px] font-semibold tracking-tight truncate">
              {profile.candidate_name || "Candidate"}
            </h2>
            <p className="text-[13px] text-muted-foreground truncate">
              {profile.role_applied || profile.candidate_position || "Applicant"}
            </p>
            {(profile.vacancy_title || profile.vacancy_company) && (
              <p className="text-[12px] text-muted-foreground mt-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  {profile.vacancy_title}
                  {profile.vacancy_company ? ` · ${profile.vacancy_company}` : ""}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {profile.candidate_email && (
            <ProfileField icon={Mail} label="Email" value={profile.candidate_email} />
          )}
          {profile.candidate_phone && (
            <ProfileField icon={Phone} label="Phone" value={profile.candidate_phone} />
          )}
          {profile.candidate_position && (
            <ProfileField
              icon={Briefcase}
              label="Current position"
              value={profile.candidate_position}
            />
          )}
          {profile.experience_years != null && (
            <ProfileField
              icon={Clock}
              label="Experience"
              value={`${profile.experience_years} year${profile.experience_years === 1 ? "" : "s"}`}
            />
          )}
        </div>

        {profile.skills && profile.skills.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-md bg-muted text-[12px] font-medium text-foreground/80 border border-border"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resume */}
      {showResume && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col max-h-[520px]">
          <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
            <h3 className="text-[14px] font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Resume
            </h3>
            {profile.resume_filename && (
              <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                {profile.resume_filename}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {hasResume ? (
              <pre className="text-[12px] leading-relaxed text-foreground/90 whitespace-pre-wrap font-sans">
                {profile.resume_text}
              </pre>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="text-[13px] font-medium mb-1">No resume on file</p>
                <p className="text-[12px] max-w-xs mx-auto">
                  The candidate has not uploaded a resume for this application.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

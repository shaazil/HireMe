import { CheckCircle2, AlertCircle, XCircle, HelpCircle } from "lucide-react";

export function RecommendationBadge({ recommendation }: { recommendation: string }) {
  let color = "";
  let label = "";
  let Icon = HelpCircle;

  switch (recommendation?.toLowerCase()) {
    case "strong_hire":
      color = "bg-emerald-100 text-emerald-800 border-emerald-200";
      label = "Strong Hire";
      Icon = CheckCircle2;
      break;
    case "hire":
      color = "bg-emerald-50 text-emerald-700 border-emerald-100";
      label = "Hire";
      Icon = CheckCircle2;
      break;
    case "maybe":
      color = "bg-amber-100 text-amber-800 border-amber-200";
      label = "Maybe";
      Icon = AlertCircle;
      break;
    case "pass":
      color = "bg-red-100 text-red-800 border-red-200";
      label = "Pass";
      Icon = XCircle;
      break;
    default:
      color = "bg-muted text-muted-foreground border-border";
      label = "Pending";
      break;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[13px] font-semibold tracking-tight ${color}`}>
      <Icon className="w-4 h-4" />
      {label}
    </div>
  );
}

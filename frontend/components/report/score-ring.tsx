import React from "react";

interface ScoreRingProps {
  score: number; // 0.0 to 5.0
  label: string;
  size?: "sm" | "md" | "lg";
}

export function ScoreRing({ score, label, size = "md" }: ScoreRingProps) {
  const maxScore = 5.0;
  const percentage = (score / maxScore) * 100;
  const radius = size === "lg" ? 40 : size === "md" ? 28 : 20;
  const stroke = size === "lg" ? 6 : size === "md" ? 4 : 3;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let colorClass = "text-emerald-500";
  if (score < 3.0) colorClass = "text-red-500";
  else if (score < 4.0) colorClass = "text-amber-500";

  const dimensions = size === "lg" ? 100 : size === "md" ? 70 : 50;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center">
        <svg
          height={dimensions}
          width={dimensions}
          className="rotate-[-90deg]"
        >
          {/* Background Ring */}
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={dimensions / 2}
            cy={dimensions / 2}
            className="text-muted/50"
          />
          {/* Progress Ring */}
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset, transition: "stroke-dashoffset 1s ease-in-out" }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={dimensions / 2}
            cy={dimensions / 2}
            className={colorClass}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-semibold ${size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-sm"}`}>
            {score.toFixed(1)}
          </span>
        </div>
      </div>
      <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

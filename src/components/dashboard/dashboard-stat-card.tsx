interface DashboardStatCardProps {
  label: string;
  value: number;
  detail: string;
}

export function DashboardStatCard({
  label,
  value,
  detail,
}: DashboardStatCardProps) {
  return (
    <article className="rounded-[1.6rem] border border-border bg-[#0a0a0c] px-6 py-5">
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p className="mt-4 text-[2.2rem] font-semibold tracking-[-0.05em] text-white">
        {value}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </article>
  );
}

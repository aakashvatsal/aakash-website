type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={`rounded-[32px] border border-white/10 bg-white/[0.035] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}
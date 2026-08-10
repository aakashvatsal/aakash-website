type EyebrowProps = {
  children: React.ReactNode;
  className?: string;
};

export function Eyebrow({ children, className = "" }: EyebrowProps) {
  return (
    <p
      className={`text-xs font-black uppercase tracking-[0.35em] text-[#C6FF32] ${className}`}
    >
      {children}
    </p>
  );
}
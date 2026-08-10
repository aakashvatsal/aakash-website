type SectionProps = {
  children: React.ReactNode;
  className?: string;
};

export function Section({ children, className = "" }: SectionProps) {
  return (
    <section
      className={`border-t border-white/10 px-6 py-32 md:px-12 lg:px-16 ${className}`}
    >
      {children}
    </section>
  );
}
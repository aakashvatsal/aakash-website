type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={className}>
      <p className="text-xs font-black uppercase tracking-[0.35em] text-[#C6FF32]">
        {eyebrow}
      </p>

      <h1 className="mt-6 max-w-6xl text-6xl font-black leading-[0.95] tracking-[-0.07em] md:text-8xl">
        {title}
      </h1>

      {description && (
        <p className="mt-8 max-w-3xl text-xl leading-9 text-white/55">
          {description}
        </p>
      )}
    </div>
  );
}
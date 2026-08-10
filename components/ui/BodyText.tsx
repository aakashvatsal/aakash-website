type BodyTextProps = {
  children: React.ReactNode;
  className?: string;
};

export function BodyText({ children, className = "" }: BodyTextProps) {
  return (
    <p className={`max-w-3xl text-lg leading-8 text-white/55 md:text-xl md:leading-9 ${className}`}>
      {children}
    </p>
  );
}
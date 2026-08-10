type DisplayTitleProps = {
  children: React.ReactNode;
  className?: string;
};

export function DisplayTitle({ children, className = "" }: DisplayTitleProps) {
  return (
    <h1
      className={`max-w-6xl text-5xl font-black leading-[0.95] tracking-[-0.06em] text-white md:text-7xl lg:text-8xl ${className}`}
    >
      {children}
    </h1>
  );
}
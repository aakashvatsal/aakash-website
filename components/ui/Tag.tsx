type TagProps = {
  children: React.ReactNode;
};

export function Tag({ children }: TagProps) {
  return (
    <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/55">
      {children}
    </span>
  );
}
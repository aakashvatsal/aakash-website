type JournalListSectionProps = {
  items: string[];
  ordered?: boolean;
};

export function JournalListSection({
  items,
  ordered = false,
}: JournalListSectionProps) {
  if (!items.length) {
    return null;
  }

  const List = ordered ? "ol" : "ul";

  return (
    <List className="space-y-4">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="flex gap-4 text-lg leading-8 text-white/65"
        >
          <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#C6FF32]" />

          <span>{item}</span>
        </li>
      ))}
    </List>
  );
}
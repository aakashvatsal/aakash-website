import type { ReactNode } from "react";

type AdminTableColumn<T> = {
  key: string;
  label: string;
  className?: string;
  render: (row: T) => ReactNode;
};

type AdminTableProps<T> = {
  rows: T[];
  columns: AdminTableColumn<T>[];
  getRowKey: (row: T) => string;
  emptyState?: ReactNode;
};

export function AdminTable<T>({
  rows,
  columns,
  getRowKey,
  emptyState,
}: AdminTableProps<T>) {
  if (!rows.length) {
    return <>{emptyState}</>;
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead className="bg-white/[0.025]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`border-b border-white/10 px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ${column.className ?? ""}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {rows.map((row) => (
              <tr
                key={getRowKey(row)}
                className="bg-[#05090b] transition hover:bg-white/[0.02]"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-5 py-4 text-sm text-white/60 ${column.className ?? ""}`}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
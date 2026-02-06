export interface TableHeaderColumn {
  label: string;
  align?: 'left' | 'center' | 'right';
  value?: string;
}

interface TableHeaderProps {
  columns: TableHeaderColumn[];
}

export const TableHeader = ({ columns }: TableHeaderProps) => {
  return (
    <thead>
      <tr className="border-b border-border bg-muted/40 dark:bg-muted/20">
        {columns.map((col, idx) => (
          <th
            key={idx}
            className={`py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${
              col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
            }`}
          >
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
  );
};

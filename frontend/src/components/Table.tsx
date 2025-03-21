import { useState, JSX } from "react";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}

interface ReusableTableProps<T> {
  columns: Column[];
  data: T[];
  actions?: (row: T) => JSX.Element;
}

const ReusableTable = <T,>({ columns, data, actions }: ReusableTableProps<T>) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(key);
      setSortOrder("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    const valueA = (a as Record<string, unknown>)[sortColumn];
    const valueB = (b as Record<string, unknown>)[sortColumn];
    if (typeof valueA === "number" && typeof valueB === "number") {
      return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
    } else {
      return sortOrder === "asc"
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    }
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded-lg shadow-md">
        <thead className="bg-gray-200 text-gray-700">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                className={`p-3 text-left cursor-pointer ${
                  col.sortable ? "hover:bg-gray-300" : ""
                }`}
              >
                {col.label} {col.sortable && (sortColumn === col.key ? (sortOrder === "asc" ? "↑" : "↓") : "⇅")}
              </th>
            ))}
            {actions && <th className="p-3">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {sortedData.length > 0 ? (
            sortedData.map((row, index) => (
              <tr key={index} className="border-t">
                {columns.map((col) => (
                  <td key={col.key} className="p-3">
                    {(row as Record<string, unknown>)[col.key] as React.ReactNode}
                  </td>
                ))}
                {actions && <td className="p-3">{actions(row)}</td>}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="p-3 text-center">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReusableTable;

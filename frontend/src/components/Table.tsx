import { useState, JSX, ReactNode } from "react";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  // Improve this type to be more specific
  render?: (value: any, row: any) => ReactNode;
}

interface ReusableTableProps<T> {
  columns: Column[];
  data: T[];
  actions?: (row: T) => JSX.Element;
  isLoading?: boolean;
}

const ReusableTable = <T extends Record<string, any>,>({ columns, data, actions, isLoading = false }: ReusableTableProps<T>) => {
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
    const valueA = a[sortColumn];
    const valueB = b[sortColumn];
    if (typeof valueA === "number" && typeof valueB === "number") {
      return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
    } else {
      return sortOrder === "asc"
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    }
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 min-h-[200px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-md">
      <table className="min-w-full bg-white dark:bg-gray-800 border-collapse">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                className={`px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                  col.sortable ? "cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600" : ""
                }`}
              >
                <div className="flex items-center space-x-1">
                  <span>{col.label}</span>
                  {col.sortable && (
                    <span className="text-gray-400">
                      {sortColumn === col.key ? (
                        sortOrder === "asc" ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )
                      ) : (
                        <svg className="w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
            {actions && <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {sortedData.length > 0 ? (
            sortedData.map((row, index) => (
              <tr 
                key={index} 
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {col.render 
                      ? col.render(row[col.key], row)
                      : row[col.key] as ReactNode}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                <div className="flex flex-col items-center">
                  <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="font-medium">No transactions found</p>
                  <p className="mt-1">Start by adding your first transaction</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReusableTable;

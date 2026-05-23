import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/src/components/ui/table";
  import { Skeleton } from "@/src/components/ui/skeleton";
  
  export interface Column<T> {
    key: string;
    label: string;
    render?: (row: T) => React.ReactNode;
  }
  
  interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    emptyMessage?: string;
    getRowId?: (row: T) => string;
  }

  function resolveRowKey<T extends Record<string, unknown>>(
    row: T,
    rowIndex: number,
    getRowId?: (row: T) => string,
  ): string {
    if (getRowId) return getRowId(row);
    const id = (row as { _id?: string })._id;
    if (id) return id;
    const firstKey = Object.keys(row)[0];
    if (firstKey && row[firstKey] != null) return String(row[firstKey]);
    return String(rowIndex);
  }
  
  const SKELETON_ROW_COUNT = 5;
  
  export default function DataTable<T extends Record<string, unknown>>({
    columns,
    data,
    isLoading = false,
    emptyMessage = "No records found.",
    getRowId,
  }: DataTableProps<T>) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-x-auto">
        <Table>
  
          {/* Header */}
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3"
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
  
          <TableBody>
  
            {/* CASE 1: Loading skeletons */}
            {isLoading &&
              Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIndex) => (
                <TableRow key={`skeleton-row-${rowIndex}`}>
                  {columns.map((col) => (
                    <TableCell key={`skeleton-cell-${col.key}`} className="py-3">
                      <Skeleton className="h-4 w-3/4 rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
  
            {/* CASE 2: Empty state */}
            {!isLoading && data.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-12 text-sm text-gray-400"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
  
            {/* CASE 3: Real data */}
            {!isLoading &&
              data.map((row, rowIndex) => (
                <TableRow
                  key={resolveRowKey(row, rowIndex, getRowId)}
                  className="hover:bg-gray-50 transition-colors duration-100"
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className="py-3 text-sm text-gray-700">
                      {col.render
                        ? col.render(row)
                        : String(row[col.key] ?? "—")}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
  
          </TableBody>
        </Table>
      </div>
    );
  }
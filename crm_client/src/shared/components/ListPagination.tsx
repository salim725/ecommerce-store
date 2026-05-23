"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/src/components/ui/pagination";

const PAGE_SIZE = 10;

export { PAGE_SIZE };

interface ListPaginationProps {
  page: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export default function ListPagination({
  page,
  totalItems,
  onPageChange,
}: ListPaginationProps) {
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  if (totalPages <= 1) return null;

  return (
    <Pagination className="justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page > 1) onPageChange(page - 1);
            }}
            className={page <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
        <PaginationItem>
          <span className="px-3 text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page < totalPages) onPageChange(page + 1);
            }}
            className={
              page >= totalPages ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

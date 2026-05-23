import { PAGE_SIZE } from "@/src/shared/components/ListPagination";

export function paginateSlice<T>(items: T[], page: number): T[] {
  const start = (page - 1) * PAGE_SIZE;
  return items.slice(start, start + PAGE_SIZE);
}

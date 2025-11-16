import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useMemo, useCallback } from "react";
import type { PaginationDto } from "../../types";

interface PaginationControlsProps {
  pagination: PaginationDto;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ pagination, onPageChange }: PaginationControlsProps) {
  const { page, limit, total } = pagination;
  const totalPages = Math.ceil(total / limit);

  // Memoize page numbers calculation
  const pageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to max visible pages
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    if (page > 3) {
      pages.push("ellipsis");
    }

    // Show current page and one page before and after
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) {
      pages.push("ellipsis");
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }, [page, totalPages]);

  // Memoize click handlers
  const handlePrevious = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (page > 1) onPageChange(page - 1);
    },
    [page, onPageChange]
  );

  const handleNext = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (page < totalPages) onPageChange(page + 1);
    },
    [page, totalPages, onPageChange]
  );

  const handlePageClick = useCallback(
    (pageNum: number) => (e: React.MouseEvent) => {
      e.preventDefault();
      onPageChange(pageNum);
    },
    [onPageChange]
  );

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={handlePrevious}
            aria-disabled={page === 1}
            className={page === 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {pageNumbers.map((pageNum, index) =>
          pageNum === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={pageNum}>
              <PaginationLink href="#" onClick={handlePageClick(pageNum)} isActive={pageNum === page}>
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={handleNext}
            aria-disabled={page === totalPages}
            className={page === totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems: number
  pageSize: number
  onPageSizeChange: (pageSize: number) => void
  nextCursor?: string | null
  hasMore?: boolean
  onNextPage?: () => void
  onPreviousPage?: () => void
  useCursor?: boolean
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  onPageSizeChange,
  nextCursor,
  hasMore,
  onNextPage,
  onPreviousPage,
  useCursor = false,
}: PaginationProps) {
  // Calculate displayed items range
  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalItems)

  // For cursor-based pagination, we only know if there are more items
  const handleNextPage = () => {
    if (useCursor) {
      onNextPage?.()
    } else {
      onPageChange(currentPage + 1)
    }
  }

  const handlePreviousPage = () => {
    if (useCursor) {
      onPreviousPage?.()
    } else {
      onPageChange(currentPage - 1)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm text-muted-foreground">
        {useCursor ? (
          <span>Showing {pageSize} items per page</span>
        ) : (
          <>
            Showing <span className="font-medium">{totalItems > 0 ? start : 0}</span> to{" "}
            <span className="font-medium">{end}</span> of <span className="font-medium">{totalItems}</span> results
          </>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          {!useCursor && (
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
              <span className="sr-only">First page</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={handlePreviousPage}
            disabled={useCursor ? !onPreviousPage : currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>

          {!useCursor && (
            <span className="text-sm">
              Page <span className="font-medium">{totalPages > 0 ? currentPage : 0}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </span>
          )}

          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={handleNextPage}
            disabled={useCursor ? !hasMore : currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>

          {!useCursor && (
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronsRight className="h-4 w-4" />
              <span className="sr-only">Last page</span>
            </Button>
          )}
        </div>

        <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number.parseInt(value))}>
          <SelectTrigger className="h-7 w-[70px]">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
            <SelectItem value="250">250</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

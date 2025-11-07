import { render, screen, fireEvent } from "@testing-library/react";
import { PaginationControls } from "./PaginationControls";
import type { PaginationDto } from "../../types";

describe("PaginationControls", () => {
  const mockOnPageChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render when there is only one page", () => {
    const pagination: PaginationDto = {
      page: 1,
      limit: 10,
      total: 5,
    };

    const { container } = render(<PaginationControls pagination={pagination} onPageChange={mockOnPageChange} />);

    expect(container.firstChild).toBeNull();
  });

  it("should render page numbers correctly for small number of pages", () => {
    const pagination: PaginationDto = {
      page: 1,
      limit: 10,
      total: 25,
    };

    render(<PaginationControls pagination={pagination} onPageChange={mockOnPageChange} />);

    // Should show all 3 pages
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should render ellipsis for large number of pages", () => {
    const pagination: PaginationDto = {
      page: 5,
      limit: 10,
      total: 100,
    };

    render(<PaginationControls pagination={pagination} onPageChange={mockOnPageChange} />);

    // Should show first page, ellipsis, current page and neighbors, ellipsis, and last page
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getAllByText("...")).toHaveLength(2);
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("should handle page changes correctly", () => {
    const pagination: PaginationDto = {
      page: 5,
      limit: 10,
      total: 100,
    };

    render(<PaginationControls pagination={pagination} onPageChange={mockOnPageChange} />);

    // Click next page
    fireEvent.click(screen.getByText("6"));
    expect(mockOnPageChange).toHaveBeenCalledWith(6);

    // Click previous page
    fireEvent.click(screen.getByText("4"));
    expect(mockOnPageChange).toHaveBeenCalledWith(4);

    // Click first page
    fireEvent.click(screen.getByText("1"));
    expect(mockOnPageChange).toHaveBeenCalledWith(1);

    // Click last page
    fireEvent.click(screen.getByText("10"));
    expect(mockOnPageChange).toHaveBeenCalledWith(10);
  });

  it("should disable previous button on first page", () => {
    const pagination: PaginationDto = {
      page: 1,
      limit: 10,
      total: 30,
    };

    render(<PaginationControls pagination={pagination} onPageChange={mockOnPageChange} />);

    const prevButton = screen.getByLabelText("Go to previous page");
    expect(prevButton).toHaveClass("pointer-events-none opacity-50");

    fireEvent.click(prevButton);
    expect(mockOnPageChange).not.toHaveBeenCalled();
  });

  it("should disable next button on last page", () => {
    const pagination: PaginationDto = {
      page: 3,
      limit: 10,
      total: 30,
    };

    render(<PaginationControls pagination={pagination} onPageChange={mockOnPageChange} />);

    const nextButton = screen.getByLabelText("Go to next page");
    expect(nextButton).toHaveClass("pointer-events-none opacity-50");

    fireEvent.click(nextButton);
    expect(mockOnPageChange).not.toHaveBeenCalled();
  });

  it("should handle next/previous navigation", () => {
    const pagination: PaginationDto = {
      page: 2,
      limit: 10,
      total: 30,
    };

    render(<PaginationControls pagination={pagination} onPageChange={mockOnPageChange} />);

    // Navigate to previous page
    const prevButton = screen.getByLabelText("Go to previous page");
    fireEvent.click(prevButton);
    expect(mockOnPageChange).toHaveBeenCalledWith(1);

    // Navigate to next page
    const nextButton = screen.getByLabelText("Go to next page");
    fireEvent.click(nextButton);
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });
});

"use client";

/**
 * StatusBadge — shared status display component.
 * Maps domain status strings to the Bakery-Warm token palette.
 */

type OrderStatus = "DRAFT" | "ACTIVE" | "PAID" | "CANCELLED";
type TableStatus = "AVAILABLE" | "OCCUPIED";
type UserStatus = "active" | "disabled";
type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

type StatusVariant =
  | OrderStatus
  | TableStatus
  | UserStatus
  | BookingStatus
  | string;

const STATUS_MAP: Record<string, { cls: string; label: string }> = {
  // Order
  DRAFT:      { cls: "status-badge-draft",     label: "Draft" },
  ACTIVE:     { cls: "status-badge-active",    label: "In Progress" },
  PAID:       { cls: "status-badge-paid",      label: "Paid" },
  CANCELLED:  { cls: "status-badge-cancelled", label: "Cancelled" },
  // Table
  AVAILABLE:  { cls: "status-badge-available", label: "Available" },
  OCCUPIED:   { cls: "status-badge-occupied",  label: "Occupied" },
  // User
  active:     { cls: "status-badge-enabled",   label: "Active" },
  disabled:   { cls: "status-badge-disabled",  label: "Disabled" },
  // Booking
  PENDING:    { cls: "status-badge-draft",     label: "Pending" },
  CONFIRMED:  { cls: "status-badge-paid",      label: "Confirmed" },
};

interface StatusBadgeProps {
  status: StatusVariant;
  /** Override the display label */
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className = "" }: StatusBadgeProps) {
  const mapping = STATUS_MAP[status] ?? {
    cls: "status-badge-draft",
    label: status,
  };

  return (
    <span className={`status-badge ${mapping.cls} ${className}`}>
      {label ?? mapping.label}
    </span>
  );
}

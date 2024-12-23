// components/admin/data-table/types.ts
import { ActionResponse, PaginatedResponse } from "@/actions/shared";
import { ColumnDef } from "@tanstack/react-table";

export type UserFormData = {
  role: "user" | "host" | "admin";
  name: string;
  status: "active" | "inactive" | "suspended" | "deleted" | "archived";
  image?: string;
  fname?: string;
  lname?: string;
  username?: string;
  email?: string;
  phone?: string;
  hostUsers?: {
    hostId: string;
    permissions: string;
    companyRole: string;
  }[];
};

export type PaginatedData<T> = {
  items: T[];
  totalPages: number;
  currentPage: number;
};
export interface BaseTableProps<TData> {
  columns: ColumnDef<TData>[];
  fetchData: (
    page: number,
    pageSize: number,
    searchTerm?: string
  ) => Promise<ActionResponse<PaginatedResponse<TData>>>;
  searchPlaceholder?: string;
  onRowClick?: (row: TData) => void;
  deleteItem?: (id: string) => Promise<void>;
  searchField?: string;
}

// types/shared.ts
import { Prisma } from "@prisma/client";

export type ActionResponse<T = null> = Promise<{
  ok: boolean;
  data: T | null;
  message: string;
}>;

export type PaginatedResponse<T> = {
  items: T[];
  totalPages: number;
  currentPage: number;
};

// Common include configurations for Prisma queries
export const COMMON_PROPERTY_SELECT = {
  images: { orderBy: { order: "asc" } },
  name: true,
  city: true,
  country: true,
  nearbyAirport: true,
  address: true,
  tagList: true,
} as const;

export const COMMON_ADMIN_LIST_INCLUDE = {
  property: {
    select: {
      name: true,
      city: true,
      country: true,
    },
  },
  host: {
    select: {
      name: true,
      id: true,
    },
  },
  images: {
    take: 1,
    orderBy: { order: "asc" },
  },
} as const;

// Base type for paginated admin queries
export type AdminListQuery = {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
};

// Helper to build search conditions for Retreat
export function buildRetreatSearchConditions(
  searchTerm: string,
  additionalFields: string[] = []
): Prisma.RetreatWhereInput {
  if (!searchTerm) return {};

  return {
    OR: [
      { name: { contains: searchTerm } },
      ...additionalFields.map((field) => ({
        [field]: { contains: searchTerm },
      })),
    ],
  };
}

// Helper to build search conditions for Program
export function buildProgramSearchConditions(
  searchTerm: string,
  additionalFields: string[] = []
): Prisma.ProgramWhereInput {
  if (!searchTerm) return {};

  return {
    OR: [
      { name: { contains: searchTerm } },
      ...additionalFields.map((field) => ({
        [field]: { contains: searchTerm },
      })),
    ],
  };
}

// Helper to build pagination parameters
export function getPaginationParams(query: AdminListQuery) {
  const page = Math.max(1, query.page || 1);
  const pageSize = Math.max(1, Math.min(100, query.pageSize || 10));
  const skip = (page - 1) * pageSize;

  return { skip, take: pageSize, page };
}

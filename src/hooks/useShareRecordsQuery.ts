import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { IShareRecord } from "../model/ShareRecord";

export interface ShareRecordsFilters {
  companyName: string | null;
  page?: number;
  limit?: number;
  actionType?: "ALL" | "BUY" | "SELL" | "DEPOSIT" | "WITHDRAW";
  status?: "ALL" | "COMPLETED" | "PENDING" | "CANCELLED";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ShareRecordsResponse {
  success: boolean;
  data: IShareRecord[];
  meta: {
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    filters: {
      companyName: string;
      actionType: string;
      status: string;
      sortBy: string;
      sortOrder: string;
    };
  };
}

export function useShareRecordsQuery(filters: ShareRecordsFilters) {
  const {
    companyName,
    page = 1,
    limit = 10,
    actionType = "ALL",
    status = "ALL",
    sortBy = "transactionDate",
    sortOrder = "desc",
  } = filters;

  return useQuery<ShareRecordsResponse, Error>({
    // Only execute the query when a specific company name is passed in
    enabled: !!companyName,

    // Comprehensive caching key to ensure distinct states for different filter combinations
    queryKey: [
      "shareRecords",
      companyName,
      page,
      limit,
      actionType,
      status,
      sortBy,
      sortOrder,
    ],

    queryFn: async () => {
      // Safely encode parameters for the URL transport
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        actionType,
        status,
        sortBy,
        sortOrder,
      });

      const url = `/api/holdings/${encodeURIComponent(
        companyName as string,
      )}/records?${queryParams.toString()}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch records for ${companyName}`);
      }

      return response.json();
    },

    // Retain UI stability during pagination switching
    placeholderData: keepPreviousData,
  });
}

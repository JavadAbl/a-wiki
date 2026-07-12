export interface GetManyQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

export interface GetManyReply<T> {
  totalCount: number;
  items: T[];
}

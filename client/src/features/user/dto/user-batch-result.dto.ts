export interface UserBatchRowResult {
  row: number;
  firstName: string;
  lastName: string;
  nationalCode: string;
  mobile: string | null;
  status: "success" | "failed";
  message?: string;
}

export interface UserBatchResult {
  totalRows: number;
  successCount: number;
  failureCount: number;
  results: UserBatchRowResult[];
  /** Base64 encoded xlsx containing only the failed rows. */
  errorFileBase64?: string;
}

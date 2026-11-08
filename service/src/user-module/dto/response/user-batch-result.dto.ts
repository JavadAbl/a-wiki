export class UserBatchRowResultDto {
  row: number;
  firstName: string;
  lastName: string;
  nationalCode: string;
  mobile: string | null;
  status: 'success' | 'failed';
  message?: string;
}

export class UserBatchResultDto {
  totalRows: number;
  successCount: number;
  failureCount: number;
  results: UserBatchRowResultDto[];
  /** Base64 encoded xlsx containing only the failed rows, ready to be uploaded again. */
  errorFileBase64?: string;
}

/**
 * Shared API-related types.
 */
export interface CallableResponse {
  status: number;
  message: string;
}

export interface CallableResponseWithData<T> extends CallableResponse {
  data?: T;
}

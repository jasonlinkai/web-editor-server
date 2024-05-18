export interface ServerResponseProps<T> {
  code: number;
  message: string;
  data: T;
}

export class ServerResponse<T> {
  public code: number;
  public message: string;
  public data: T;
  constructor({ code, message, data }: ServerResponseProps<T>) {
    this.code = code;
    this.message = message;
    this.data = data;
  }
}

export interface ServerErrorResponseProps<T> {
  code: number;
  message: string;
  data: T;
}

export class ServerErrorResponse<T> {
  public code: number;
  public message: string;
  public data: T;
  constructor({ code, message, data }: ServerErrorResponseProps<T>) {
    this.code = code;
    this.message = message;
    this.data = data;
  }
}

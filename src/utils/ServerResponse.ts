interface ResponseProps<T> {
  code: number;
  message: string;
  data: T;
}

class ServerResponse<T> {
  public code: number;
  public message: string;
  public data: T;
  constructor({ code, message, data }: ResponseProps<T>) {
    this.code = code;
    this.message = message;
    this.data = data;
  }
}

export default ServerResponse;

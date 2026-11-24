export class NetworkError extends Error {
  readonly url: string;

  constructor(url: string, cause?: unknown) {
    super(`Request to ${url} failed`);
    this.name = "NetworkError";
    this.url = url;
    this.cause = cause;
  }
}

export class HttpError extends Error {
  readonly url: string;
  readonly status: number;

  constructor(url: string, status: number, statusText: string) {
    super(`Request to ${url} answered ${status} ${statusText}`);
    this.name = "HttpError";
    this.url = url;
    this.status = status;
  }
}

export class ParseError extends Error {
  readonly url: string;

  constructor(url: string, cause?: unknown) {
    super(`Response from ${url} is not valid JSON`);
    this.name = "ParseError";
    this.url = url;
    this.cause = cause;
  }
}

export class SchemaValidationError extends Error {
  readonly details: string[];

  constructor(subject: string, details: string[]) {
    super(`The ${subject} does not match the schema`);
    this.name = "SchemaValidationError";
    this.details = details;
  }
}

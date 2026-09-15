export class CliError extends Error {
  readonly code: string;
  readonly hint?: string;

  constructor(message: string, code = "FONIJ_ERROR", hint?: string) {
    super(message);
    this.name = "CliError";
    this.code = code;
    this.hint = hint;
  }
}

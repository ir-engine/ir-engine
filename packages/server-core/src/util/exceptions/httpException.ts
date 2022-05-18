export class HttpException extends Error {
  statusCode: number
  message: string

  constructor(message, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
  }
}

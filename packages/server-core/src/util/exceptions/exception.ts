import { HttpException } from './httpException'

export class UnauthorizedException extends HttpException {
  constructor(message: string) {
    super(message, 401)
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string) {
    super(message, 404)
  }
}

export class UnauthenticatedException extends HttpException {
  constructor(message: string) {
    super(message, 403)
  }
}

/** Throw from a route to answer with this status; Fastify turns it into `{ error }`. */
export class HttpError extends Error {
  readonly statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
  }
}

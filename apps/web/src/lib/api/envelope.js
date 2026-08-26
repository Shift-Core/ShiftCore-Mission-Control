/**
 * @template T
 * @typedef {Object} SuccessEnvelope
 * @property {true} success
 * @property {string} message
 * @property {T} data
 */

/**
 * @typedef {Object} FieldError
 * @property {string} field
 * @property {string} message
 */

/**
 * @typedef {Object} ErrorEnvelope
 * @property {false} success
 * @property {string} message
 * @property {null} data
 * @property {string} errorCode
 * @property {FieldError[]} errors
 * @property {string} traceId
 */

const isObject = (value) => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export const isSuccessEnvelope = (value) => {
  return (
    isObject(value) &&
    value.success === true &&
    typeof value.message === 'string' &&
    Object.hasOwn(value, 'data')
  )
}

export const isErrorEnvelope = (value) => {
  return (
    isObject(value) &&
    value.success === false &&
    typeof value.message === 'string' &&
    value.data === null &&
    typeof value.errorCode === 'string' &&
    Array.isArray(value.errors) &&
    typeof value.traceId === 'string'
  )
}

export class ApiError extends Error {
  constructor({
    message,
    errorCode = 'UNKNOWN_ERROR',
    errors = [],
    traceId = null,
    status = null,
    cause,
  }) {
    super(message)

    this.name = 'ApiError'
    this.errorCode = errorCode
    this.errors = errors
    this.traceId = traceId
    this.status = status
    this.cause = cause
  }
}

export const apiErrorFromEnvelope = (envelope, options = {}) => {
  return new ApiError({
    message: envelope.message,
    errorCode: envelope.errorCode,
    errors: envelope.errors,
    traceId: envelope.traceId,
    status: options.status,
    cause: options.cause,
  })
}

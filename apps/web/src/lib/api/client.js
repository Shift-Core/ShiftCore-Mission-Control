import axios from 'axios'

import {
  ApiError,
  apiErrorFromEnvelope,
  isErrorEnvelope,
  isSuccessEnvelope,
} from './envelope'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  config.headers = config.headers || {}
  config.headers['Accept'] = 'application/json'
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    const envelope = response.data

    if (isSuccessEnvelope(envelope)) {
      return envelope
    }

    if (isErrorEnvelope(envelope)) {
      return Promise.reject(
        apiErrorFromEnvelope(envelope, {
          status: response.status,
        }),
      )
    }

    return Promise.reject(
      new ApiError({
        message: 'The server returned an invalid response.',
        errorCode: 'INVALID_RESPONSE',
        status: response.status,
      }),
    )
  },
  (error) => {
    if (error instanceof ApiError) {
      return Promise.reject(error)
    }

    const envelope = error.response?.data

    if (isErrorEnvelope(envelope)) {
      return Promise.reject(
        apiErrorFromEnvelope(envelope, {
          status: error.response.status,
          cause: error,
        }),
      )
    }

    if (axios.isCancel(error)) {
      return Promise.reject(
        new ApiError({
          message: 'The request was cancelled.',
          errorCode: 'REQUEST_CANCELLED',
          cause: error,
        }),
      )
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(
        new ApiError({
          message: 'The request timed out. Please try again.',
          errorCode: 'REQUEST_TIMEOUT',
          cause: error,
        }),
      )
    }

    if (!error.response) {
      return Promise.reject(
        new ApiError({
          message: 'Unable to connect to the server.',
          errorCode: 'NETWORK_ERROR',
          cause: error,
        }),
      )
    }

    return Promise.reject(
      new ApiError({
        message: 'The server returned an unexpected error.',
        errorCode: 'HTTP_ERROR',
        status: error.response.status,
        cause: error,
      }),
    )
  },
)

export default apiClient

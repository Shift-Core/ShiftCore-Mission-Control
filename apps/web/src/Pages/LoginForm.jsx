import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/useAuth'
import { endpoints } from '@/lib/api/endpoints'
import { ApiError } from '@/lib/api/envelope'

const EMPTY_FIELD_ERRORS = {
  email: '',
  password: '',
}

const UNAVAILABLE_ERROR_CODES = new Set([
  'HTTP_ERROR',
  'INVALID_RESPONSE',
  'NETWORK_ERROR',
  'REQUEST_TIMEOUT',
])

const getFieldErrors = (error) => {
  if (!(error instanceof ApiError)) {
    return EMPTY_FIELD_ERRORS
  }

  return error.errors.reduce(
    (fieldErrors, currentError) => {
      const field = currentError.field?.toLowerCase()

      if (field === 'email' || field === 'password') {
        fieldErrors[field] = currentError.message
      }

      return fieldErrors
    },
    { ...EMPTY_FIELD_ERRORS },
  )
}

const LoginForm = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [errors, setErrors] = useState(EMPTY_FIELD_ERRORS)

  const isLoading = status === 'loading'
  const isError = status === 'error'
  const isSuccess = status === 'success'

  useEffect(() => {
    if (!isSuccess) {
      return undefined
    }

    const redirectTimer = window.setTimeout(() => {
      navigate('/mission-control', {
        replace: true,
      })
    }, 800)

    return () => window.clearTimeout(redirectTimer)
  }, [isSuccess, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()

    const newErrors = { ...EMPTY_FIELD_ERRORS }

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required'
    }

    if (newErrors.email || newErrors.password) {
      setErrors(newErrors)
      setStatus('idle')
      setErrorMessage('')
      return
    }

    setErrors({ ...EMPTY_FIELD_ERRORS })

    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await endpoints.login.request({
        email: email.trim(),
        password,
      })

      login(response.data.user)
      setStatus('success')
    } catch (error) {
      const serverIsUnavailable =
        error instanceof ApiError &&
        (UNAVAILABLE_ERROR_CODES.has(error.errorCode) ||
          (error.status !== null && error.status >= 500))

      if (serverIsUnavailable) {
        navigate('/sign-in-unavailable', {
          replace: true,
        })
        return
      }

      setErrors(getFieldErrors(error))
      setStatus('error')
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : 'Unable to sign in. Please try again.',
      )
    }
  }

  const inputClass = (hasError) => `
    h-12
    w-full
    rounded-[4px]
    border
    bg-white
    px-3
    text-base
    text-[#0B1C30]
    shadow-none
    focus-visible:ring-0
    transition-colors
    duration-200
    ${
      hasError
        ? 'border-[#BA1A1A] focus-visible:border-[#BA1A1A] hover:border-[#BA1A1A]'
        : 'border-[#C5C6CD] focus-visible:border-[#1E293B] hover:border-[#8B95A6]'
    }
    disabled:bg-[#F5F5F5]
    disabled:text-[#8B95A6]
    disabled:cursor-not-allowed
  `

  const clearFieldError = (field) => {
    setErrors((current) => ({
      ...current,
      [field]: '',
    }))

    if (isError) {
      setStatus('idle')
      setErrorMessage('')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-8 flex w-full flex-col gap-6"
    >
      {/* Error feedback */}
      {isError && (
        <div
          role="alert"
          className="
            flex
            min-h-[54px]
            w-full
            items-start
            gap-2
            rounded-r-[4px]
            border-l-4
            border-[#BA1A1A]
            bg-[#FFDAD6]
            px-4
            py-3
            text-sm
            text-[#93000A]
            animate-in
            fade-in
            slide-in-from-top-2
            duration-300
          "
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0" />

          <span className="leading-5">
            {errorMessage}
          </span>
        </div>
      )}

      {/* Success feedback */}
      {isSuccess && (
        <div
          role="status"
          className="
            flex
            min-h-[54px]
            w-full
            items-start
            gap-2
            rounded-r-[4px]
            border-l-4
            border-[#2E7D32]
            bg-[#E8F5E9]
            px-4
            py-3
            text-sm
            text-[#1B5E20]
            animate-in
            fade-in
            slide-in-from-top-2
            duration-300
          "
        >
          <CheckCircle className="mt-0.5 size-5 shrink-0" />

          <span className="leading-5">
            Signed in successfully. Redirecting...
          </span>
        </div>
      )}

      {/* Email */}
      <div className="flex w-full flex-col gap-1">
        <Label
          htmlFor="email"
          className="text-sm font-medium text-[#0B1C30]"
        >
          Email Address
        </Label>

        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="admin@shiftcore.local"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            clearFieldError('email')
          }}
          disabled={isLoading || isSuccess}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={
            errors.email ? 'email-error' : undefined
          }
          className={inputClass(Boolean(errors.email))}
        />

        {errors.email && (
          <p
            id="email-error"
            className="text-sm text-[#BA1A1A]"
          >
            {errors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="flex w-full flex-col gap-1">
        <Label
          htmlFor="password"
          className="text-sm font-medium text-[#0B1C30]"
        >
          Password
        </Label>

        <div className="relative w-full">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              clearFieldError('password')
            }}
            disabled={isLoading || isSuccess}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password
                ? 'password-error'
                : undefined
            }
            className={`${inputClass(Boolean(errors.password))} pr-11`}
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword((value) => !value)
            }
            disabled={isLoading || isSuccess}
            aria-label={
              showPassword
                ? 'Hide password'
                : 'Show password'
            }
            className="
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              text-[#515F74]
              transition-colors
              hover:text-[#1E293B]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          />

        </div>

        {errors.password && (
          <p
            id="password-error"
            className="text-sm text-[#BA1A1A]"
          >
            {errors.password}
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="w-full pt-2">
        <Button
          type="submit"
          disabled={isLoading || isSuccess}
          className={`
            flex
            h-12
            w-full
            items-center
            justify-center
            gap-2
            rounded-[4px]
            text-sm
            font-medium
            text-white
            shadow-none
            transition-all
            duration-300
            ${
              isSuccess
                ? 'bg-[#2E7D32] hover:bg-[#1B5E20]'
                : isLoading
                  ? 'cursor-not-allowed bg-[#1E293B]'
                  : 'bg-[#1E293B] hover:bg-[#111827] active:bg-[#0D1218]'
            }
            ${(isLoading || isSuccess) && 'disabled:opacity-100'}
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 shrink-0 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle className="size-4 shrink-0" />
              <span>Signed in</span>
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </div>
    </form>
  )
}

export default LoginForm

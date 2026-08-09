import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/useAuth'

const VALID_EMAIL = 'lead@shiftcore.com'
const VALID_PASSWORD = 'password123'

function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()

  // Fixture states:
  // /login
  // /login?state=loading
  // /login?state=error
  // /login?state=success

  const fixtureState = new URLSearchParams(
    window.location.search,
  ).get('state')

  const isFixtureState = ['loading', 'error', 'success'].includes(
    fixtureState,
  )

  const initialStatus = isFixtureState ? fixtureState : 'idle'

  const [email, setEmail] = useState(
    fixtureState === 'error' ? 'invalid-email@task' : '',
  )

  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [status, setStatus] = useState(initialStatus)

  const [errorMessage, setErrorMessage] = useState(
    fixtureState === 'error' ? 'Invalid email or password' : '',
  )

  const isLoading = status === 'loading'
  const isSuccess = status === 'success'
  const hasError = status === 'error'

  const clearError = () => {
    if (hasError) {
      setStatus('idle')
      setErrorMessage('')
    }
  }

  const handleEmailChange = (event) => {
    setEmail(event.target.value)
    clearError()
  }

  const handlePasswordChange = (event) => {
    setPassword(event.target.value)
    clearError()
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    setErrorMessage('')

    if (!email.trim() || !password.trim()) {
      setStatus('error')
      setErrorMessage('Email and password are required')
      return
    }

    setStatus('loading')

    // Fixture-driven authentication for R24-06.
    // Real API integration is intentionally deferred.
    setTimeout(() => {
      const isValidCredentials =
        email.trim() === VALID_EMAIL &&
        password === VALID_PASSWORD

      if (!isValidCredentials) {
        setStatus('error')
        setErrorMessage('Invalid email or password')
        return
      }

      // Auth skeleton only.
      // No token or browser storage is used.
      login()
      setStatus('success')

      setTimeout(() => {
        navigate('/mission-control', { replace: true })
      }, 500)
    }, 800)
  }

  const inputBaseClass =
    'h-14 w-full rounded-xl border bg-white text-base text-[#051A3E] shadow-none outline-none transition-colors'

  const normalInputClass = `${inputBaseClass}
    border-[#C7CFDF]
    placeholder:text-[#78849B]
    focus-visible:border-[#0052CC]
    focus-visible:ring-2
    focus-visible:ring-[#0052CC]/15`

  const errorInputClass = `${inputBaseClass}
     border-[#BA1A1A]
     placeholder:text-[#78849B]
     focus-visible:border-[#BA1A1A]
     focus-visible:ring-2
     focus-visible:ring-[#BA1A1A]/15`

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-8 space-y-6"
    >
      {/* Email */}
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className={`text-sm font-semibold ${
            hasError ? 'text-[#BA1A1A]' : 'text-[#051A3E]'
          }`}
        >
          Email
        </Label>

        <div className="relative">
          <Mail
            aria-hidden="true"
            className={`absolute left-4 top-1/2 size-5 -translate-y-1/2 ${
              hasError ? 'text-[#BA1A1A]' : 'text-[#6B7890]'
            }`}
          />

          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            value={email}
            onChange={handleEmailChange}
            disabled={isLoading || isSuccess}
            aria-invalid={hasError}
            aria-describedby={hasError ? 'login-error' : undefined}
            className={`pl-12 pr-4 ${hasError ? errorInputClass : normalInputClass}`}
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label
          htmlFor="password"
          className={`text-sm font-semibold ${
            hasError ? 'text-[#BA1A1A]' : 'text-[#051A3E]'
          }`}
        >
          Password
        </Label>

        <div className="relative">
          <LockKeyhole
            aria-hidden="true"
            className={`absolute left-4 top-1/2 size-5 -translate-y-1/2 ${
              hasError ? 'text-[#BA1A1A]' : 'text-[#6B7890]'
            }`}
          />

          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={handlePasswordChange}
            disabled={isLoading || isSuccess}
            aria-invalid={hasError}
            aria-describedby={hasError ? 'login-error' : undefined}
            className={`pl-12 pr-12 ${hasError ? errorInputClass : normalInputClass}`}
          />

          <button
            type="button"
            aria-label={
              showPassword ? 'Hide password' : 'Show password'
            }
            onClick={() => setShowPassword((value) => !value)}
            disabled={isLoading || isSuccess}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7890] transition-colors hover:text-[#0052CC] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {showPassword ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        </div>

        {/* Error */}
        {hasError && (
          <p
            id="login-error"
            role="alert"
            className="text-sm font-medium text-[#BA1A1A]"
          >
            {errorMessage}
          </p>
        )}
      </div>

      {/* Remember me + Forgot password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) =>
              setRememberMe(checked === true)
            }
            disabled={isLoading || isSuccess}
            className="size-5 rounded-[4px] border-[#9AA8BD] data-[state=checked]:border-[#0052CC] data-[state=checked]:bg-[#0052CC] data-[state=checked]:text-white"
          />

          <Label
            htmlFor="remember-me"
            className="cursor-pointer text-sm font-normal text-[#33415C]"
          >
            Remember me
          </Label>
        </div>

        <button
          type="button"
          className="text-sm font-medium text-[#0052CC] transition-colors hover:text-[#0047B3]"
          onClick={() => {}}
        >
          Forgot Password?
        </button>
      </div>

      {/* Success */}
      {isSuccess && (
        <div
          role="status"
          className="flex min-h-14 items-center gap-3 rounded-xl border border-[#16A34A]/25 bg-[#F0FDF4] px-4 py-3 text-sm font-medium text-[#168A4A]"
        >
          <CheckCircle2 className="size-5 shrink-0 text-[#16A34A]" />

          <span>Login Successful</span>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={isLoading || isSuccess}
        className={`h-14 w-full rounded-xl text-base font-semibold text-white shadow-none transition-colors ${
          isSuccess
            ? 'bg-[#4F86D9] hover:bg-[#4F86D9]'
            : 'bg-[#0052CC] hover:bg-[#0047B3]'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            Authenticating...
          </>
        ) : isSuccess ? (
          <>
            <CheckCircle2 className="size-5" />
            Login Successful
          </>
        ) : (
          'Sign In'
        )}
      </Button>
    </form>
  )
}

export default LoginForm
import { useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const VALID_EMAIL = "lead@shiftcore.com";
const VALID_PASSWORD = "password123";

function LoginForm() {
  // Fixture states:
  // /login
  // /login?state=loading
  // /login?state=error
  // /login?state=success

  const fixtureState = new URLSearchParams(window.location.search).get("state");

  const initialStatus =
    fixtureState === "loading" ||
    fixtureState === "success" ||
    fixtureState === "error"
      ? fixtureState
      : "idle";

  const [email, setEmail] = useState(
    fixtureState === "error" ? "invalid-email@task" : "",
  );

  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [status, setStatus] = useState(initialStatus);

  const [errorMessage, setErrorMessage] = useState(
    fixtureState === "error" ? "Invalid email or password" : "",
  );

  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const hasError = status === "error";

  const handleSubmit = (event) => {
    event.preventDefault();

    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setStatus("error");
      setErrorMessage("Email and password are required");
      return;
    }

    setStatus("loading");

    // Fixture-driven authentication for R24-06.
    // Real API integration is intentionally deferred.
    setTimeout(() => {
      if (email.trim() === VALID_EMAIL && password === VALID_PASSWORD) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage("Invalid email or password");
      }
    }, 800);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);

    if (hasError) {
      setStatus("idle");
      setErrorMessage("");
    }
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);

    if (hasError) {
      setStatus("idle");
      setErrorMessage("");
    }
  };

  const emailInputClassName = hasError
    ? "h-16 rounded-xl border-[#BA1A1A] bg-white pl-12 pr-4 text-base text-[#FFDAD6] placeholder:text-[#FFDAD6] focus-visible:border-[#ba1a1a] focus-visible:ring-[#ba1a1a]/20"
    : "h-16 rounded-xl border-[#BA1A1A] bg-white pl-12 pr-4 text-base text-[#FFDAD6] placeholder:text-[#FFDAD6] focus-visible:border-[#0052cc] focus-visible:ring-[#0052cc]/20";

  const passwordInputClassName = hasError
    ? "h-16 rounded-xl border-[#ba1a1a] bg-white pl-12 pr-12 text-base text-[#FFDAD6] placeholder:text-[#FFDAD6] focus-visible:border-[#FFDAD6] focus-visible:ring-[#ba1a1a]/20"
    : "h-16 rounded-xl border-[#c7cfdf] bg-white pl-12 pr-12 text-base text-[#FFDAD6] placeholder:text-[#78849b] focus-visible:border-[#FFDAD6] focus-visible:ring-[#0052cc]/20";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Email */}
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className={`text-base font-semibold ${
            hasError ? "text-[#ba1a1a]" : "text-[#051a3e]"
          }`}
        >
          Email
        </Label>

        <div className="relative">
          <Mail
            aria-hidden="true"
            className={`absolute left-4 top-1/2 size-5 -translate-y-1/2 ${
              hasError ? "text-[#ba1a1a]" : "text-[#6b7890]"
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
            aria-describedby={hasError ? "login-error" : undefined}
            className={emailInputClassName}
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label
          htmlFor="password"
          className={`text-base font-semibold ${
            hasError ? "text-[#ba1a1a]" : "text-[#051a3e]"
          }`}
        >
          Password
        </Label>

        <div className="relative">
          <LockKeyhole
            aria-hidden="true"
            className={`absolute left-4 top-1/2 size-5 -translate-y-1/2 ${
              hasError ? "text-[#ba1a1a]" : "text-[#6b7890]"
            }`}
          />

          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={handlePasswordChange}
            disabled={isLoading || isSuccess}
            aria-invalid={hasError}
            aria-describedby={hasError ? "login-error" : undefined}
            className={passwordInputClassName}
          />

          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((value) => !value)}
            disabled={isLoading || isSuccess}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7890] transition hover:text-[#0052cc] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {showPassword ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        </div>

        {/* Error message */}
        {hasError && (
          <p
            id="login-error"
            role="alert"
            className="text-sm font-medium text-[#ba1a1a]"
          >
            {errorMessage}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
            disabled={isLoading || isSuccess}
            className="size-5 rounded-[4px] border-[#9aa8bd] data-[state=checked]:border-[#0052cc] data-[state=checked]:bg-[#0052cc] data-[state=checked]:text-white"
          />

          <Label
            htmlFor="remember-me"
            className="cursor-pointer text-base font-normal text-[#33415c]"
          >
            Remember me
          </Label>
        </div>

        <a
          href="#"
          className="text-sm font-medium text-[#0052cc] transition hover:text-[#0047b3]"
          onClick={(event) => event.preventDefault()}
        >
          Forgot Password?
        </a>
      </div>

      {/* Success State */}
      {isSuccess && (
        <div
          role="status"
          className="flex h-14 items-center gap-3 rounded-xl border border-[#16a34a]/30 bg-[#16a34a]/5 px-4 text-sm font-medium text-[#168a4a]"
        >
          <CheckCircle2 className="size-5 shrink-0 text-[#16a34a]" />

          <span>Login Successful</span>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={isLoading || isSuccess}
        className={`h-16 w-full rounded-xl text-lg font-semibold text-white shadow-none ${
          isSuccess
            ? "bg-[#4f86d9] hover:bg-[#4f86d9]"
            : "bg-[#0052cc] hover:bg-[#0047b3]"
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
          "Sign In"
        )}
      </Button>
    </form>
  );
}

export default LoginForm;

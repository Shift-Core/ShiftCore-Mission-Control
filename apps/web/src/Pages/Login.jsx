import LoginForm from './LoginForm'
import Footer from '@/components/Footer'

function Login() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f8fc]">
      <main className="flex flex-1 items-start justify-center px-4 py-16">
        <section
          aria-labelledby="login-title"
          className="w-full max-w-[528px] rounded-2xl border border-[#d9dce5] bg-white px-10 py-12 shadow-sm sm:px-12"
        >
          {/* Logo */}
          <div className="flex justify-center">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#0052cc] text-white">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="size-7"
                  aria-hidden="true"
                >
                  <path
                    d="M5 12.5L9.5 17L19 7.5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <span className="text-3xl font-bold tracking-tight text-[#0052cc]">
                ShiftCore
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="mt-8 text-center">
            <h1
              id="login-title"
              className="text-4xl font-semibold tracking-tight text-[#051a3e]"
            >
              Welcome Back
            </h1>

            <p className="mt-3 text-lg text-[#33415c]">
              Sign in to continue to ShiftCore Mission Control
            </p>
          </div>

          <LoginForm />
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Login
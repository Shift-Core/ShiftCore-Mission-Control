function Footer() {
  return (
    <footer className="border-t border-[#cdd4e2] bg-[#eef1ff] px-8 py-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xl font-semibold text-[#051a3e]">
            ShiftCore
          </p>

          <p className="mt-1 text-sm text-[#667085]">
            © 2026 ShiftCore Inc. All rights reserved.
          </p>
        </div>

        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap gap-x-6 gap-y-2"
        >
          <a
            href="#privacy"
            className="text-sm text-[#33415c] underline underline-offset-2 hover:text-[#0052cc]"
          >
            Privacy Policy
          </a>

          <a
            href="#terms"
            className="text-sm text-[#33415c] underline underline-offset-2 hover:text-[#0052cc]"
          >
            Terms of Service
          </a>

          <a
            href="#security"
            className="text-sm text-[#33415c] underline underline-offset-2 hover:text-[#0052cc]"
          >
            Security
          </a>

          <a
            href="#status"
            className="text-sm text-[#33415c] underline underline-offset-2 hover:text-[#0052cc]"
          >
            Status
          </a>
        </nav>
      </div>
    </footer>
  )
}

export default Footer
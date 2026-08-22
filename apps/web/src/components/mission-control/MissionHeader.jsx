import { useAuth } from "@/context/useAuth"

const navItems = [
  "Dashboard",
  "Task Board",
  "Analytics",
  "Reports",
  "Settings",
]

function MissionHeader() {
  const { logout } = useAuth()
  return (
    <header className="h-[72px] border-b border-[#c9ced8] bg-white">
      <div className="flex h-full items-center justify-between px-7">
        <div className="flex h-full items-center gap-8">
          <div className="text-[24px] font-bold tracking-[-0.5px] text-[#10213a]">
            ShiftCore Mission Control
          </div>

          <nav className="hidden h-full items-center gap-6 md:flex">
            {navItems.map((item) => (
              <button
                key={item}
                type="button"
                className={`relative h-full text-[16px] ${
                  item === "Dashboard"
                    ? "font-semibold text-[#0b1730]"
                    : "text-[#4d5666]"
                }`}
              >
                {item}

                {item === "Dashboard" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#101c31]" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-5 text-[#344054]">
          <button
            type="button"
            aria-label="Notifications"
            className="text-[22px]"
          >
            ♧
          </button>

          <button
            type="button"
            aria-label="Help"
            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#4b5565] text-[13px] font-bold"
          >
            ?
          </button>

          <div className="h-8 w-px bg-[#c9ced8]" />

          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e2b40] text-[14px] font-semibold text-white">
              AR
            </div>

            <span className="hidden text-[15px] font-semibold text-[#243249] sm:block">
              Alex Rivera
            </span>
          </div>

          <button
            type="button"
            onClick={logout}
            className="text-[15px] text-[#52617a] hover:text-[#10213a]"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default MissionHeader
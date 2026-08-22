import { useNavigate } from 'react-router-dom'
import { CloudOff, RefreshCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'

function SignInUnavailable() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <section
        aria-labelledby="unavailable-title"
        className="
          flex
          w-full
          max-w-[480px]
          flex-col
          items-center
          rounded-[4px]
          border
          border-[#C5C6CD]
          bg-white
          p-8
          shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]
          lg:-translate-y-[53px]
        "
      >
        {/* Brand */}
        <header className="flex h-[84px] w-[141.59px] flex-col items-start pb-6">
          <div className="flex h-[60px] w-full flex-col items-start gap-1">
            <h1
              className="
                flex
                h-10
                w-full
                items-center
                justify-center
                text-center
                font-inter
                text-[32px]
                font-bold
                leading-10
                tracking-[-0.64px]
                text-[#091426]
              "
            >
              ShiftCore
            </h1>

            <p
              className="
                flex
                h-4
                w-full
                items-center
                justify-center
                text-center
                text-[12px]
                font-semibold
                leading-4
                tracking-[1.2px]
                text-[#515F74]
              "
            >
              MISSION CONTROL
            </p>
          </div>
        </header>

        {/* Alert Icon */}
        <div className="flex h-[88px] w-16 items-start pb-6">
          <div
            className="
              flex
              size-16
              items-center
              justify-center
              rounded-[12px]
              bg-[#E5EEFF]
            "
          >
            <CloudOff
              aria-hidden="true"
              className="size-[29px] text-[#091426]"
              strokeWidth={2}
            />
          </div>
        </div>

        {/* Title */}
        <div className="flex h-10 w-[220.41px] items-start pb-2">
          <h2
            id="unavailable-title"
            className="
              flex
              h-8
              w-full
              items-center
              justify-center
              text-center
              text-[24px]
              font-semibold
              leading-8
              tracking-[-0.24px]
              text-[#0B1C30]
            "
          >
            Sign-in Unavailable
          </h2>
        </div>

        {/* Description */}
        <div className="flex h-[72px] w-full max-w-[320px] flex-col items-center pb-8">
          <p
            className="
              flex
              h-10
              w-full
              items-center
              justify-center
              px-[27.5px]
              text-center
              text-[14px]
              font-normal
              leading-5
              text-[#45474C]
            "
          >
            Please try again to reconnect to Mission Control.
          </p>
        </div>

        {/* Action */}
        <Button
          type="button"
          onClick={() => navigate('/login', { replace: true })}
          className="
            h-12
            w-full
            rounded-none
            bg-[#1E293B]
            p-0
            text-[14px]
            font-medium
            leading-5
            text-white
            shadow-none
            hover:bg-[#1E293B]
          "
        >
          <RefreshCcw
            aria-hidden="true"
            className="size-[13.33px]"
            strokeWidth={2}
          />

          <span>Try Again</span>
        </Button>
      </section>
    </main>
  )
}

export default SignInUnavailable
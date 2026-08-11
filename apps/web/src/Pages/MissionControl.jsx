import { Loader2, AlertCircle, FolderOpen } from 'lucide-react'

function MissionControl() {
  const fixtureState = new URLSearchParams(window.location.search).get('state')

  if (fixtureState === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f9fc] p-8">
        <div className="flex flex-col items-center gap-4 text-[#5f6b82]">
          <Loader2 className="size-8 animate-spin text-[#0052cc]" />
          <p className="text-lg font-medium">Loading Mission Control...</p>
        </div>
      </main>
    )
  }

  if (fixtureState === 'error') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f9fc] p-8">
        <div className="flex max-w-md flex-col items-center text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-[#fef2f2]">
            <AlertCircle className="size-8 text-[#ba1a1a]" />
          </div>
          <h2 className="text-2xl font-semibold text-[#051a3e]">Failed to load data</h2>
          <p className="mt-2 text-[#5f6b82]">We encountered an error while loading your mission control dashboard. Please try again later.</p>
        </div>
      </main>
    )
  }

  if (fixtureState === 'empty') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f9fc] p-8">
        <div className="flex max-w-md flex-col items-center text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-[#f8fafc] border border-[#e2e8f0]">
            <FolderOpen className="size-8 text-[#94a3b8]" />
          </div>
          <h2 className="text-2xl font-semibold text-[#051a3e]">No missions found</h2>
          <p className="mt-2 text-[#5f6b82]">You don't have any active missions. Create a new one to get started.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f8f9fc] p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-[#051a3e]">
          ShiftCore Mission Control
        </h1>

        <p className="mt-2 text-[#5f6b82]">
          Mission Control combined screen
        </p>
      </div>
    </main>
  )
}

export default MissionControl
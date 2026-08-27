const MissionState = ({ type = 'loading', description, onRetry }) => {
  const states = {
    loading: {
      title: 'Loading Mission Control',
      description: 'Loading your mission control data...',
    },

    empty: {
      title: 'No Active Sprint',
      description:
        "The task board and metrics are currently dormant. Start a new sprint to begin tracking progress, blockers, and team velocity.",
    },

    error: {
      title: 'Unable to Load Dashboard Data',
      description:
        "We are currently experiencing difficulty retrieving your mission control metrics. This may be due to a temporary network issue or server unavailability.",
    },
  }

  const current = states[type] ?? states.loading

  if (type === 'loading') {
    return (
      <div className="rounded-[5px] border border-[#c9ced8] bg-white p-12">
        <div className="mx-auto max-w-xl animate-pulse">
          <div className="mx-auto h-12 w-12 rounded bg-[#e8edf6]" />

          <div className="mx-auto mt-6 h-7 w-64 rounded bg-[#e8edf6]" />

          <div className="mx-auto mt-4 h-4 w-80 rounded bg-[#eef1f6]" />

          <div className="mt-8 h-12 rounded bg-[#eef1f6]" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[5px] border border-[#c9ced8] bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-[#eef3ff] text-3xl text-[#5b6575]">
        {type === 'error' ? '!' : '▣'}
      </div>

      <h2 className="mt-6 text-[25px] font-bold text-[#10213a]">
        {current.title}
      </h2>

      <p className="mx-auto mt-3 max-w-[620px] text-[16px] leading-6 text-[#687386]">
        {description || current.description}
      </p>

      {type === 'empty' && (
        <div className="mt-7 flex justify-center gap-3">
          <button
            type="button"
            className="bg-[#172338] px-5 py-2.5 text-sm font-medium text-white"
          >
            Plan New Sprint
          </button>

          <button
            type="button"
            className="border border-[#c9ced8] bg-white px-5 py-2.5 text-sm font-medium text-[#243249]"
          >
            View Backlog
          </button>
        </div>
      )}

      {type === 'error' && (
        <div className="mt-7 flex justify-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="bg-[#172338] px-5 py-2.5 text-sm font-medium text-white"
          >
            Retry Connection
          </button>

          <button
            type="button"
            className="border border-[#c9ced8] bg-white px-5 py-2.5 text-sm font-medium text-[#243249]"
          >
            Check System Status
          </button>
        </div>
      )}
    </div>
  )
}

export default MissionState

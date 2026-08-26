const getBlockerAge = (createdAt) => {
  const createdDate = new Date(createdAt)

  if (Number.isNaN(createdDate.getTime())) {
    return 'Unknown'
  }

  const elapsedDays = Math.max(
    0,
    Math.floor((Date.now() - createdDate.getTime()) / 86_400_000),
  )

  return `${elapsedDays} ${elapsedDays === 1 ? 'day' : 'days'}`
}

const ActiveBlocker = ({ blockers = [], tasks = [] }) => {
  if (blockers.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {blockers.map((blocker) => {
        const task = tasks.find((item) => item.id === blocker.taskId)

        return (
          <section
            key={blocker.id}
            className="rounded-[5px] border border-[#e11d25] bg-[#fff6f6] p-5"
          >
            <div className="flex items-center gap-2 border-b border-[#f1aeb2] pb-3">
              <span className="text-[24px] text-[#d42128]">⚠</span>

              <h2 className="text-[17px] font-semibold text-[#c92128]">
                ACTIVE BLOCKER
              </h2>
            </div>

            <div className="mt-5">
              <p className="text-[14px] font-semibold text-[#c92128]">
                [{task?.code ?? blocker.taskId}]
              </p>

              <h3 className="mt-2 text-[17px] font-semibold text-[#9f2228]">
                {blocker.title}
              </h3>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[13px] uppercase text-[#b55b60]">
                    OWNER
                  </p>

                  <p className="mt-1 text-[15px] text-[#c92128]">
                    {blocker.ownerName || 'Unassigned'}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[13px] uppercase text-[#b55b60]">
                    AGE
                  </p>

                  <p className="mt-1 text-[15px] text-[#c92128]">
                    {getBlockerAge(blocker.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default ActiveBlocker

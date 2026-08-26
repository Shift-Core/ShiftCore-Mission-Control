const WeeklySummary = ({
  schemaVersion,
  sprint,
  kpis,
  activeBlockers = [],
  tasks = [],
}) => {
  const primaryBlocker = activeBlockers[0]
  const blockedTask = primaryBlocker
    ? tasks.find((task) => task.id === primaryBlocker.taskId)
    : null
  const completedTask = tasks.find((task) => task.status === 'Done')

  return (
    <section className="rounded-[5px] border border-[#c9ced8] bg-white p-5">
      <div className="flex items-center justify-between border-b border-[#c9ced8] pb-3">
        <h2 className="text-[17px] font-semibold text-[#10213a]">
          Weekly Summary
        </h2>

        <span className="rounded-[3px] bg-[#eef2f7] px-2 py-1 text-[13px] text-[#596274]">
          v{schemaVersion}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[#555b65]">
          DETERMINISTIC PREVIEW
        </span>

        <button
          type="button"
          className="border border-[#c9ced8] bg-white px-3 py-2 text-[14px] font-medium text-[#243249] hover:bg-[#f6f7fa]"
        >
          Generate preview
        </button>
      </div>

      <div className="mt-3 rounded-[3px] border border-[#c9ced8] bg-[#f8f9fc] p-3 text-[16px] leading-[1.4] text-[#243249]">
        <p>{sprint.name} Progress:</p>

        <p>
          - {kpis.doneTasks} tasks completed, {kpis.inProgressTasks}{' '}
          currently in progress.
        </p>

        <p>
          - Overall completion rate stands at {kpis.completionRate}%.
        </p>

        {primaryBlocker ? (
          <p>
            - CRITICAL: [{blockedTask?.code ?? primaryBlocker.taskId}]{' '}
            {primaryBlocker.title}. Owner:{' '}
            {primaryBlocker.ownerName || 'Unassigned'}.
          </p>
        ) : (
          <p>- No active blockers.</p>
        )}

        {completedTask && (
          <p>
            - {completedTask.title} ([{completedTask.code}]) completed
            successfully
            {completedTask.ownerName
              ? ` by ${completedTask.ownerName}`
              : ''}
            .
          </p>
        )}
      </div>
    </section>
  )
}

export default WeeklySummary

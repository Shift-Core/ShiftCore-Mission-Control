function StartTaskDialog({ task, open, onCancel, onConfirm }) {
  if (!open || !task) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10213a]/35 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="start-task-title"
        className="w-full max-w-[560px] rounded-[6px] border border-[#c9ced8] bg-white shadow-xl"
      >
        <div className="border-b border-[#e1e5eb] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#172338] text-white">
              ▶
            </div>

            <div>
              <h2
                id="start-task-title"
                className="text-[19px] font-semibold text-[#10213a]"
              >
                Start Task
              </h2>

              <p className="text-[13px] text-[#687386]">
                Task ID: {task.id}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <p className="text-[15px] leading-6 text-[#344054]">
            You are about to start work on{" "}
            <strong>"{task.title}"</strong>. This will transition
            the task status from{" "}
            <span className="rounded bg-[#eef2f7] px-1.5 py-0.5 text-xs font-semibold">
              TO DO
            </span>{" "}
            to{" "}
            <span className="rounded bg-[#dbe9ff] px-1.5 py-0.5 text-xs font-semibold text-[#2862c7]">
              IN PROGRESS
            </span>
            .
          </p>

          <div className="mt-5 border-l-4 border-[#172338] bg-[#f4f6fa] px-4 py-3 text-[14px] leading-5 text-[#52617a]">
            Starting this task will automatically assign you as
            the primary owner and notify the project stakeholders.
            Ensure you have reviewed all technical requirements
            before proceeding.
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#e1e5eb] px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="border border-[#c9ced8] bg-white px-4 py-2 text-[14px] font-medium text-[#243249]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="bg-[#172338] px-4 py-2 text-[14px] font-medium text-white"
          >
            🚀 Confirm Start
          </button>
        </div>
      </div>
    </div>
  )
}

export default StartTaskDialog
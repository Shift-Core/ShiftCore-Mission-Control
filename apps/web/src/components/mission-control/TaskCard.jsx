const STATUS_DETAILS = {
  ToDo: {
    label: 'To Do',
    styles: 'bg-[#eef2f7] text-[#52617a]',
  },
  InProgress: {
    label: 'In Progress',
    styles: 'bg-[#dbe9ff] text-[#2862c7]',
  },
  Done: {
    label: 'Done',
    styles: 'bg-[#d9f5ec] text-[#15916c]',
  },
}

const getInitials = (ownerName) => {
  if (!ownerName) {
    return '—'
  }

  return ownerName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0].toUpperCase())
    .join('')
}

const TaskCard = ({ task, onStart }) => {
  const status = STATUS_DETAILS[task.status] ?? {
    label: task.status,
    styles: 'bg-[#eef2f7] text-[#52617a]',
  }

  return (
    <article
      className={`border bg-white px-2.5 py-2 ${
        task.blocked
          ? 'border-l-[4px] border-l-[#ef4444]'
          : 'border-[#c9ced8]'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-semibold text-[#555b65]">
          [{task.code}]
        </span>

        <span
          className={`rounded-[3px] px-2 py-1 text-[13px] ${
            status.styles
          }`}
        >
          {status.label}
        </span>
      </div>

      <h3
        className={`mt-3 border-b border-[#e4e7ec] pb-3 text-[16px] font-semibold ${
          task.status === 'Done'
            ? 'text-[#707782] line-through'
            : 'text-[#10213a]'
        }`}
      >
        {task.title}
      </h3>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#566275] text-[12px] font-semibold text-white">
            {getInitials(task.ownerName)}
          </span>

          <span className="text-[14px] text-[#596274]">
            {task.ownerName || 'Unassigned'}
          </span>
        </div>

        {task.status === 'ToDo' && (
          <button
            type="button"
            onClick={() => onStart?.(task)}
            className="rounded-[3px] bg-[#172338] px-3 py-1.5 text-[13px] font-medium text-white hover:bg-[#24344d]"
          >
            Start task
          </button>
        )}

        {task.blocked && (
          <span
            className="text-[20px] leading-none text-[#dc2626]"
            title="Blocked"
            aria-label="Blocked"
          >
            !
          </span>
        )}
      </div>
    </article>
  )
}

export default TaskCard

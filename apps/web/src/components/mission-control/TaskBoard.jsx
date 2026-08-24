import TaskCard from './TaskCard'

const TASK_COLUMNS = [
  { status: 'ToDo', title: 'TO DO' },
  { status: 'InProgress', title: 'IN PROGRESS' },
  { status: 'Done', title: 'DONE' },
]

const TaskColumn = ({ title, tasks: columnTasks, onStart }) => {
  return (
    <div className="min-h-[450px] rounded-[5px] bg-[#eef3ff] p-2.5">
      <h3 className="px-1 py-1 text-[14px] font-semibold text-[#555b65]">
        {title}
      </h3>

      <div className="mt-1 space-y-2">
        {columnTasks.length > 0 ? (
          columnTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStart={onStart}
            />
          ))
        ) : (
          <div className="rounded border border-dashed border-[#c9ced8] bg-white p-6 text-center text-sm text-[#687386]">
            No tasks
          </div>
        )}
      </div>
    </div>
  )
}

const TaskBoard = ({ tasks = [], onStart }) => {
  return (
    <section className="min-w-0">
      <div className="mb-4 border-b border-[#c9ced8] pb-2">
        <h2 className="text-[24px] font-bold text-[#10213a]">
          Task Board
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {TASK_COLUMNS.map((column) => (
          <TaskColumn
            key={column.status}
            title={column.title}
            tasks={tasks.filter((task) => task.status === column.status)}
            onStart={onStart}
          />
        ))}
      </div>
    </section>
  )
}

export default TaskBoard

import TaskCard from "./TaskCard"

const tasks = {
  todo: [
    {
      id: "SC-102",
      title: "Refactor API endpoints",
      status: "To Do",
      initials: "AR",
      owner: "Alex R.",
    },
  ],

  progress: [
    {
      id: "SC-105",
      title: "Schema Migration",
      status: "In Progress",
      initials: "SK",
      owner: "Sam K.",
      blocked: true,
    },
  ],

  done: [
    {
      id: "SC-101",
      title: "Auth Logic",
      status: "Done",
      initials: "AR",
      owner: "Alex R.",
    },
  ],
}

function TaskColumn({ title, tasks: columnTasks, onStart }) {
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

function TaskBoard({ onStart }) {
  return (
    <section className="min-w-0">
      <div className="mb-4 border-b border-[#c9ced8] pb-2">
        <h2 className="text-[24px] font-bold text-[#10213a]">
          Task Board
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <TaskColumn
          title="TO DO"
          tasks={tasks.todo}
          onStart={onStart}
        />

        <TaskColumn
          title="IN PROGRESS"
          tasks={tasks.progress}
          onStart={onStart}
        />

        <TaskColumn
          title="DONE"
          tasks={tasks.done}
          onStart={onStart}
        />
      </div>
    </section>
  )
}

export default TaskBoard
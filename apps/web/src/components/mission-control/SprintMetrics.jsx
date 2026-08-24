const SprintMetrics = ({ kpis }) => {
  const metrics = [
    {
      value: kpis.plannedTasks,
      label: 'PLANNED',
    },
    {
      value: kpis.toDoTasks,
      label: 'TO DO',
    },
    {
      value: kpis.inProgressTasks,
      label: 'IN PROGRESS',
      accent: 'blue',
    },
    {
      value: kpis.doneTasks,
      label: 'DONE',
      accent: 'green',
    },
    {
      value: `${kpis.completionRate}%`,
      label: 'COMPLETION',
    },
    {
      value: kpis.activeBlockers,
      label: 'ACTIVE BLOCKERS',
      accent: 'red',
    },
  ]
  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-6">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className={`relative flex min-h-[98px] flex-col items-center justify-center rounded-[5px] border bg-white ${
            metric.accent === 'red'
              ? "border-[#e11d25]"
              : "border-[#c9ced8]"
          }`}
        >
          {metric.accent === 'blue' && (
            <span className="absolute bottom-0 left-0 top-0 w-[4px] rounded-l bg-[#3478f6]" />
          )}

          {metric.accent === 'green' && (
            <span className="absolute bottom-0 left-0 top-0 w-[4px] rounded-l bg-[#16b98a]" />
          )}

          <span
            className={`text-[29px] font-bold ${
              metric.accent === 'red'
                ? "text-[#c92128]"
                : "text-[#10213a]"
            }`}
          >
            {metric.value}
          </span>

          <span
            className={`mt-1 text-[13px] font-semibold ${
              metric.accent === 'red'
                ? "text-[#c92128]"
                : "text-[#555b65]"
            }`}
          >
            {metric.label}
          </span>
        </div>
      ))}
    </section>
  )
}

export default SprintMetrics

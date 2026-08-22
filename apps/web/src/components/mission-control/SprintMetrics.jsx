const metrics = [
  {
    value: "24",
    label: "PLANNED",
  },
  {
    value: "8",
    label: "TO DO",
  },
  {
    value: "6",
    label: "IN PROGRESS",
    accent: "blue",
  },
  {
    value: "10",
    label: "DONE",
    accent: "green",
  },
  {
    value: "42%",
    label: "COMPLETION",
  },
  {
    value: "2",
    label: "ACTIVE BLOCKERS",
    accent: "red",
  },
]

function SprintMetrics() {
  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-6">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className={`relative flex min-h-[98px] flex-col items-center justify-center rounded-[5px] border bg-white ${
            metric.accent === "red"
              ? "border-[#e11d25]"
              : "border-[#c9ced8]"
          }`}
        >
          {metric.accent === "blue" && (
            <span className="absolute bottom-0 left-0 top-0 w-[4px] rounded-l bg-[#3478f6]" />
          )}

          {metric.accent === "green" && (
            <span className="absolute bottom-0 left-0 top-0 w-[4px] rounded-l bg-[#16b98a]" />
          )}

          <span
            className={`text-[29px] font-bold ${
              metric.accent === "red"
                ? "text-[#c92128]"
                : "text-[#10213a]"
            }`}
          >
            {metric.value}
          </span>

          <span
            className={`mt-1 text-[13px] font-semibold ${
              metric.accent === "red"
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
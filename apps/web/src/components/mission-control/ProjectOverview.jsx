const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const formatDate = (value) => {
  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date)
}

const ProjectOverview = ({ project, sprint }) => {
  return (
    <section className="rounded-[5px] border border-[#c9ced8] bg-white px-7 py-7">
      <div className="grid gap-7 md:grid-cols-[1fr_1fr_2fr]">
        <div>
          <p className="text-[14px] font-semibold uppercase text-[#555b65]">
            Project
          </p>

          <p className="mt-2 text-[18px] font-semibold text-[#10213a]">
            {project.name}
          </p>
        </div>

        <div>
          <p className="text-[14px] font-semibold uppercase text-[#555b65]">
            Sprint
          </p>

          <p className="mt-2 text-[18px] font-semibold text-[#10213a]">
            {sprint.name}
          </p>
        </div>

        <div>
          <p className="text-[14px] font-semibold uppercase text-[#555b65]">
            Goal
          </p>

          <p className="mt-2 text-[17px] text-[#243249]">
            {sprint.goal}
          </p>
        </div>
      </div>

      <div className="mt-7">
        <p className="text-[14px] font-semibold uppercase text-[#555b65]">
          Dates
        </p>

        <p className="mt-2 text-[16px] text-[#243249]">
          {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
        </p>
      </div>
    </section>
  )
}

export default ProjectOverview

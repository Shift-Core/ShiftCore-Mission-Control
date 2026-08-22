function ProjectOverview() {
  return (
    <section className="rounded-[5px] border border-[#c9ced8] bg-white px-7 py-7">
      <div className="grid gap-7 md:grid-cols-[1fr_1fr_2fr]">
        <div>
          <p className="text-[14px] font-semibold uppercase text-[#555b65]">
            Project
          </p>

          <p className="mt-2 text-[18px] font-semibold text-[#10213a]">
            Core Infrastructure
          </p>
        </div>

        <div>
          <p className="text-[14px] font-semibold uppercase text-[#555b65]">
            Sprint
          </p>

          <p className="mt-2 text-[18px] font-semibold text-[#10213a]">
            Sprint 24 - Stability Alpha
          </p>
        </div>

        <div>
          <p className="text-[14px] font-semibold uppercase text-[#555b65]">
            Goal
          </p>

          <p className="mt-2 text-[17px] text-[#243249]">
            Improve database query latency and harden auth middleware
          </p>
        </div>
      </div>

      <div className="mt-7">
        <p className="text-[14px] font-semibold uppercase text-[#555b65]">
          Dates
        </p>

        <p className="mt-2 text-[16px] text-[#243249]">
          Aug 20, 2026 - Sep 03, 2026
        </p>
      </div>
    </section>
  )
}

export default ProjectOverview
import { useState } from "react"


import MissionHeader from "../components/mission-control/MissionHeader"
import ProjectOverview from "../components/mission-control/ProjectOverview"
import SprintMetrics from "../components/mission-control/SprintMetrics"
import TaskBoard from "../components/mission-control/TaskBoard"
import ActiveBlocker from "../components/mission-control/ActiveBlocker"
import WeeklySummary from "../components/mission-control/WeeklySummary"
import StartTaskDialog from "../components/mission-control/StartTaskDialog"
import MissionState from "../components/mission-control/MissionState"

function MissionControl() {
  const params = new URLSearchParams(window.location.search)
  const fixtureState = params.get("state") || "default"

  const [selectedTask, setSelectedTask] = useState(null)

  const showState = ["loading", "empty", "error"].includes(
    fixtureState,
  )

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#10213a]">
      <MissionHeader />

      <main className="px-5 py-7 md:px-7">
        <div className="mx-auto max-w-[1388px]">
          {showState ? (
            <MissionState
              type={fixtureState}
              onRetry={() => {
                window.location.href = "/mission-control"
              }}
            />
          ) : (
            <>
              <ProjectOverview />

              <div className="mt-6">
                <SprintMetrics />
              </div>

              <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_445px]">
                <TaskBoard
                  onStart={(task) => setSelectedTask(task)}
                />

                <aside className="space-y-6">
                  <ActiveBlocker />

                  <WeeklySummary />
                </aside>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="mt-8 border-t border-[#c9ced8] bg-[#eef2ff] px-7 py-5">
        <div className="mx-auto flex max-w-[1388px] flex-col gap-4 text-[14px] text-[#596274] md:flex-row md:items-center md:justify-between">
          <p>© 2026 ShiftCore Mission Control. Enterprise Edition.</p>

          <div className="flex gap-6">
            <button type="button">Privacy Policy</button>
            <button type="button">Terms of Service</button>
            <button type="button">Support</button>
            <button type="button">Documentation</button>
          </div>
        </div>
      </footer>

      <StartTaskDialog
        task={selectedTask}
        open={Boolean(selectedTask)}
        onCancel={() => setSelectedTask(null)}
        onConfirm={() => {
          setSelectedTask(null)
        }}
      />
    </div>
  )
}

export default MissionControl
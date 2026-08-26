import { useCallback, useEffect, useState } from 'react'

import ActiveBlocker from '@/components/mission-control/ActiveBlocker'
import MissionHeader from '@/components/mission-control/MissionHeader'
import MissionState from '@/components/mission-control/MissionState'
import ProjectOverview from '@/components/mission-control/ProjectOverview'
import SprintMetrics from '@/components/mission-control/SprintMetrics'
import StartTaskDialog from '@/components/mission-control/StartTaskDialog'
import TaskBoard from '@/components/mission-control/TaskBoard'
import WeeklySummary from '@/components/mission-control/WeeklySummary'
import { useAuth } from '@/context/useAuth'
import { endpoints } from '@/lib/api/endpoints'
import { ApiError } from '@/lib/api/envelope'

const MissionControl = () => {
  const { clearSession } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [viewState, setViewState] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedTask, setSelectedTask] = useState(null)
  const [isStartingTask, setIsStartingTask] = useState(false)
  const [taskActionError, setTaskActionError] = useState('')

  const loadMissionControl = useCallback(
    (signal) => {
      return endpoints.missionControl
        .request({ signal })
        .then((response) => {
          if (!response.data) {
            setDashboard(null)
            setViewState('empty')
            return
          }

          setDashboard(response.data)
          setViewState('success')
        })
        .catch((error) => {
          if (
            error instanceof ApiError &&
            error.errorCode === 'REQUEST_CANCELLED'
          ) {
            return
          }

          if (error instanceof ApiError && error.status === 401) {
            clearSession()
            return
          }

          setDashboard(null)
          setViewState('error')
          setErrorMessage(
            error instanceof ApiError
              ? error.message
              : 'Unable to load Mission Control data.',
          )
        })
    },
    [clearSession],
  )

  const retryMissionControl = () => {
    setViewState('loading')
    setErrorMessage('')
    loadMissionControl()
  }

  const selectTaskToStart = (task) => {
    setTaskActionError('')
    setSelectedTask(task)
  }

  const cancelStartTask = () => {
    if (isStartingTask) {
      return
    }

    setTaskActionError('')
    setSelectedTask(null)
  }

  const startSelectedTask = async () => {
    if (!selectedTask || isStartingTask) {
      return
    }

    setIsStartingTask(true)
    setTaskActionError('')

    try {
      await endpoints.updateTaskStatus.request({
        id: selectedTask.id,
      })

      setSelectedTask(null)
      setViewState('loading')
      await loadMissionControl()
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSession()
        return
      }

      setTaskActionError(
        error instanceof ApiError
          ? error.message
          : 'Unable to start this task. Please try again.',
      )
    } finally {
      setIsStartingTask(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()

    loadMissionControl(controller.signal)

    return () => controller.abort()
  }, [loadMissionControl])

  const showDashboard = viewState === 'success' && dashboard

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#10213a]">
      <MissionHeader />

      <main className="px-5 py-7 md:px-7">
        <div className="mx-auto max-w-[1388px]">
          {showDashboard ? (
            <>
              <ProjectOverview
                project={dashboard.project}
                sprint={dashboard.sprint}
              />

              <div className="mt-6">
                <SprintMetrics kpis={dashboard.kpis} />
              </div>

              <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_445px]">
                <TaskBoard
                  tasks={dashboard.tasks}
                  onStart={selectTaskToStart}
                />

                <aside className="space-y-6">
                  <ActiveBlocker
                    blockers={dashboard.activeBlockers}
                    tasks={dashboard.tasks}
                  />

                  <WeeklySummary
                    schemaVersion={dashboard.schemaVersion}
                    sprint={dashboard.sprint}
                    kpis={dashboard.kpis}
                    activeBlockers={dashboard.activeBlockers}
                    tasks={dashboard.tasks}
                  />
                </aside>
              </div>
            </>
          ) : (
            <MissionState
              type={viewState}
              description={errorMessage}
              onRetry={retryMissionControl}
            />
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
        isSubmitting={isStartingTask}
        errorMessage={taskActionError}
        onCancel={cancelStartTask}
        onConfirm={startSelectedTask}
      />
    </div>
  )
}

export default MissionControl

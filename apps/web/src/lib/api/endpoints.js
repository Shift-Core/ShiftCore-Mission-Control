import apiClient from './client'

/**
 * @typedef {Object} LoginReq
 * @property {String} email
 * @property {String} password
 */

/**
 * @typedef {Object} User
 * @property {String} id
 * @property {String} name
 * @property {String} email
 * @property {'Lead' | 'Super' | 'Core' | 'Identity'} role
 * @property {String | null} teamId
 */

/**
 * @typedef {Object} LoginRes
 * @property {String} expiresAt
 * @property {User} user
 */

/**
 * @typedef {Object} MissionControlProject
 * @property {String} iid
 * @property {String} code
 * @property {String} name
 * @property {'Planned' | 'Active' | 'Paused' | 'Closed'} status
 */

/**
 * @typedef {Object} MissionControlSprint
 * @property {String} id
 * @property {String} name
 * @property {String} projectId
 * @property {'Planned' | 'Active' | 'Closed' | 'Cancelled'} 
 * @property {String} goal
 * @property {Date} startDate 
 * @property {Date} endDate 
 */

/**
 * @typedef {Object} MissionControlTask
 * @property {String} code
 * @property {String} id
 * @property {String} ownerName
 * @property {String} projectId
 * @property {String} sprintId
 * @property {'ToDo' | 'InProgress' | 'Done'} status
 * @property {String} title
 * @property {Date} updatedAt
 * @property {Boolean} blocked
 */

/**
 * @typedef {Object} MissionControlActiveBlocker
 * @property {String} createdAt
 * @property {String} id
 * @property {String} ownerName
 * @property {String} projectId
 * @property {String} sprintId
 * @property {'Active'} status
 * @property {String} taskId
 * @property {String} title
 */

/**
 * @typedef {Object} MissionControlKpis
 * @property {Number} plannedTasks
 * @property {Number} toDoTasks
 * @property {Number} inProgressTasks
 * @property {Number} doneTasks
 * @property {Number} completionRate
 * @property {Number} activeBlockers
 */

/**
 * @typedef {Object} MissionControlRes
 * @property {String} schemaVersion
 * @property {MissionControlProject} project
 * @property {MissionControlSprint} sprint
 * @property {Array<MissionControlTask>} task
 * @property {Array<MissionControlActiveBlocker>} activeBlockers
 * @property {MissionControlKpis} kpis
 */

/**
 * @typedef {Object} UpdateTaskStatusReq
 * @property {String} id
 */

/**
 * @template T
 * @typedef {Object} EndpointSuccessResponse
 * @property {true} success
 * @property {String} message
 * @property {T} data
 */

/**
 * @template TRequest
 * @template TResponse
 * @typedef {Object} ApiEndpoint
 * @property {'GET' | 'POST' | 'PATCH'} method
 * @property {String} path
 * @property {(request: TRequest) => Promise<EndpointSuccessResponse<TResponse>>} request
 */

/** @type {ApiEndpoint<LoginReq, LoginRes>} */
const loginEndpoint = {
  method: 'POST',
  path: '/identity/v1/auth/login',
  request: (data) => {
    return apiClient.request({
      method: 'POST',
      url: '/identity/v1/auth/login',
      data,
    })
  },
}


/** @type {ApiEndpoint<void, MissionControlRes>} */
const missionControlEndpoint = {
  method: 'GET',
  path: '/core/v1/mission-control',
  request: () => {
    return apiClient.request({
      method: 'GET',
      url: '/core/v1/mission-control',
    })
  },
}

/** @type {ApiEndpoint<UpdateTaskStatusReq, MissionControlTask>} */
const updateTaskStatusEndpoint = {
  method: 'PATCH',
  path: '/core/v1/tasks/:id/status',
  request: ({ id }) => {
    return apiClient.request({
      method: 'PATCH',
      url: `/core/v1/tasks/${encodeURIComponent(id)}/status`,
    })
  },
}

export const endpoints = Object.freeze({
  login: Object.freeze(loginEndpoint),
  missionControl: Object.freeze(missionControlEndpoint),
  updateTaskStatus: Object.freeze(updateTaskStatusEndpoint),
})

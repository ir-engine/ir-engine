import { ProjectUpdateType } from './ProjectInterface'

export type UpdateProjectInterface = {
  sourceURL: string
  destinationURL: string
  name: string
  reset: boolean
  commitSHA: string
  sourceBranch: string
  updateType: ProjectUpdateType
  updateSchedule: string
}

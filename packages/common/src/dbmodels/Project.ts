export interface ProjectInterface {
  id: string
  name: string
  thumbnail: string
  repositoryPath: string
  settings: string
  needsRebuild: boolean
  sourceRepo: string
  sourceBranch: string
  updateType: string
  updateSchedule: string
  updateUserId: string
  commitSHA: string
  commitDate: string
}

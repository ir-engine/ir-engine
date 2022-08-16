import { ProjectPermissionInterface } from './ProjectPermissionInterface'

export interface ProjectInterface {
  id: string
  name: string
  thumbnail: string
  repositoryPath: string
  description?: string
  settings?: string
  needsRebuild: boolean
  hasWriteAccess?: boolean
  project_permissions?: ProjectPermissionInterface[]
}

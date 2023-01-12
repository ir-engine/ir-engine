import { IPackageJson } from 'package-json-type'

import { ProjectPermissionInterface } from './ProjectPermissionInterface'

export type ProjectUpdateType = 'none' | 'commit' | 'tag'

export const DefaultUpdateSchedule = '0 * * * *'

export interface ProjectInterface {
  id: string
  name: string
  thumbnail: string
  repositoryPath: string
  version?: string
  engineVersion?: string
  description?: string
  settings?: string
  needsRebuild: boolean
  sourceRepo?: string
  sourceBranch?: string
  updateType: ProjectUpdateType
  updateSchedule?: string
  updateUserId?: string
  hasWriteAccess?: boolean
  project_permissions?: ProjectPermissionInterface[]
  commitSHA?: string
  commitDate?: Date
}

export interface ProjectPackageJsonType extends IPackageJson {
  etherealEngine: {
    version: string
  }
}

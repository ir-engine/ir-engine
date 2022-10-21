import { IPackageJson } from 'package-json-type'

import { ProjectPermissionInterface } from './ProjectPermissionInterface'

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
  hasWriteAccess?: boolean
  project_permissions?: ProjectPermissionInterface[]
}

export interface ProjectPackageJsonType extends IPackageJson {
  etherealEngine: {
    version: string
  }
}

/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { IPackageJson } from 'package-json-type'

import { ProjectPermissionInterface } from './ProjectPermissionInterface'

export type ProjectUpdateType = 'none' | 'commit' | 'tag'

export const DefaultUpdateSchedule = '0 * * * *'

export interface ProjectInterface {
  id: string
  name: string
  thumbnail?: string
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

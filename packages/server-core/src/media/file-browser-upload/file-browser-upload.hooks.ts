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

import { iff, isProvider } from 'feathers-hooks-common'
import { SYNC } from 'feathers-sync'

import verifyScope from '../../hooks/verify-scope'

// An example of calculating the remaining space left on a hypothetical project max size
// const projectNameRegex = /projects\/([^/]+)/
// const PROJECT_MAX_SIZE = 100 * 1000 * 1000 //100 MB

// const checkProjectSize = async (context: HookContext) => {
//   const { data, params } = context
//   const projectNameExec = projectNameRegex.exec(data.path)
//   if (!projectNameExec) throw new BadRequest('Files must be uploaded in a project')
//   const storageProvider = getStorageProvider()
//   const projectName = projectNameExec[1]
//   const projectSize = await storageProvider.getFolderSize(`projects/${projectName}`)
//   const isCurrentFile = await storageProvider.doesExist(data.fileName, data.path)
//   let existingFileSize = 0
//   if (isCurrentFile) existingFileSize = (await storageProvider.getObject(`${data.path}${data.fileName}`)).Body.length
//   const newFileSize = params.files[0].size
//   if (newFileSize - existingFileSize + projectSize > PROJECT_MAX_SIZE) throw new BadRequest(
//       `The file you are uploading would put this project over the max project size of ${PROJECT_MAX_SIZE / 1000000} MB. Uploaded file size: ${newFileSize / 1000000 } MB. Free space in project: ${(PROJECT_MAX_SIZE - projectSize) / 1000000} MB.`
//   )
//   return context
// }

export default {
  before: {
    all: [iff(isProvider('external'), verifyScope('editor', 'write'))],
    find: [],
    get: [],
    create: [
      (context) => {
        context[SYNC] = false
        return context
      }
    ],
    update: [],
    patch: [
      (context) => {
        context[SYNC] = false
        return context
      }
    ],
    remove: []
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any

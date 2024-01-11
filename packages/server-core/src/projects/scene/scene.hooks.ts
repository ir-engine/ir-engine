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

import { ProjectType, projectPath } from '@etherealengine/common/src/schemas/projects/project.schema'
import { SceneCreateData } from '@etherealengine/common/src/schemas/projects/scene.schema'
import { BadRequest } from '@feathersjs/errors'
import { HookContext, Paginated } from '@feathersjs/feathers'
import { iff, isProvider } from 'feathers-hooks-common'
import { createSkippableHooks } from '../../hooks/createSkippableHooks'
import projectPermissionAuthenticate from '../../hooks/project-permission-authenticate'
import setResponseStatusCode from '../../hooks/set-response-status-code'
import verifyScope from '../../hooks/verify-scope'

const checkIfProjectExists = async (context: HookContext, project: string) => {
  const projectResult = (await context.app
    .service(projectPath)
    .find({ query: { name: project, $limit: 1 } })) as Paginated<ProjectType>
  if (projectResult.data.length === 0) throw new Error(`No project named ${project} exists`)
}

const getSceneKey = async (context: HookContext) => {
  const { project, name, sceneKey } = context.params.query
  if (!sceneKey) {
    if (project) {
      checkIfProjectExists(context, project)
    }

    context.params.query = { ...context.params.query, sceneKey: `projects/${project}/${name}.scene.json` }
  }
}

const getDirectoryFromData = async (context: HookContext) => {
  if (!context.data) {
    throw new BadRequest(`${context.path} service data is empty`)
  }

  if (context.method === 'create') {
    const data: SceneCreateData[] = Array.isArray(context.data) ? context.data : [context.data]

    if (!data[0].directory) {
      for (const item of data) {
        checkIfProjectExists(context, item.project!)
        item.directory = `projects/${item.project}/`
        item.localDirectory = `packages/projects/projects/${item.project}/`
      }
      context.data = data.length === 1 ? data[0] : data
    }
  } else {
    if (!context.data.directory) {
      checkIfProjectExists(context, context.data.project)
      context.data.directory = `projects/${context.data.project}/`
      context.data.localDirectory = `packages/projects/projects/${context.data.project}/`
    }
  }
}

const getDirectoryFromQuery = async (context: HookContext) => {
  if (!context.params.query.directory) {
    checkIfProjectExists(context, context.params.query.project)
    context.params.query.directory = `projects/${context.params.query.project}/`
    context.params.query.localDirectory = `packages/projects/projects/${context.params.query.project}/`
  }
}

export default createSkippableHooks(
  {
    before: {
      all: [],
      find: [],
      get: [getSceneKey],
      create: [
        iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
        getDirectoryFromData
      ],
      update: [
        iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
        getDirectoryFromData
      ],
      patch: [
        iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
        getDirectoryFromData
      ],
      remove: [
        iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
        getDirectoryFromQuery
      ]
    },

    after: {
      all: [],
      find: [],
      get: [],
      create: [
        // Editor is expecting 200, while feather is sending 201 for creation
        setResponseStatusCode(200)
      ],
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
  },
  []
)

/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { BadRequest } from '@feathersjs/errors'
import { LocationData, UserID } from '@ir-engine/common/src/schema.type.module'
import { apiJobPath } from '@ir-engine/common/src/schemas/cluster/api-job.schema'
import { fileBrowserPath } from '@ir-engine/common/src/schemas/media/file-browser.schema'
import { invalidationPath } from '@ir-engine/common/src/schemas/media/invalidation.schema'
import { StaticResourceType, staticResourcePath } from '@ir-engine/common/src/schemas/media/static-resource.schema'
import { ProjectData, ProjectType, projectPath } from '@ir-engine/common/src/schemas/projects/project.schema'
import { locationPath } from '@ir-engine/common/src/schemas/social/location.schema'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import { Application } from '@ir-engine/server-core/declarations'
import config from '@ir-engine/server-core/src/appconfig'
import { createExecutorJob, getJobBody } from '@ir-engine/server-core/src/k8s-job-helper'
import * as k8s from '@kubernetes/client-node'
import { v4 as uuidv4 } from 'uuid'
import logger from '../../ServerLogger'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'

const sceneRelativePathIdentifier = '__$project$__'

export async function getProjectPublishJobBody(
  app: Application,
  projectId: string,
  projectPublishId: string,
  userId: UserID,
  updatedAt: string,
  locations: LocationData[],
  jobId: string
): Promise<k8s.V1Job> {
  const command = [
    'npx',
    'cross-env',
    'ts-node',
    '--swc',
    'scripts/publish-project.ts',
    '--projectId',
    projectId,
    '--projectPublishId',
    projectPublishId,
    '--userId',
    userId,
    '--updatedAt',
    updatedAt,
    '--locations',
    JSON.stringify(locations),
    '--jobId',
    jobId
  ]

  const labels = {
    'ir-engine/projectPublish': 'true',
    'ir-engine/projectId': projectId,
    'ir-engine/release': process.env.RELEASE_NAME!
  }

  const name = `${process.env.RELEASE_NAME}-project-publish-${projectId}`
  return getJobBody(app, command, name, labels)
}

export async function startProjectPublish(
  app: Application,
  projectId: string,
  projectPublishId: string,
  userId: UserID,
  updatedAt: string,
  locations: LocationData[],
  isJob = false,
  jobId = undefined
) {
  if (!config.kubernetes.enabled || isJob)
    return publishProject(app, projectId, projectPublishId, userId, updatedAt, locations, jobId)
  else {
    const date = await getDateTimeSql()
    const newJob = await app.service(apiJobPath).create({
      name: '',
      startTime: date,
      endTime: date,
      returnData: '',
      status: 'pending'
    })
    logger.info(`Added api job: ${newJob}`)
    const jobBody = await getProjectPublishJobBody(
      app,
      projectId,
      projectPublishId,
      userId,
      updatedAt,
      locations,
      newJob.id
    )

    logger.info(`Added job body: ${jobBody}`)
    await app.service(apiJobPath).patch(newJob.id, {
      name: jobBody.metadata!.name
    })
    logger.info(`Patched job: ${jobBody}`)

    const jobLabelSelector = `ir-engine/projectId=${projectId},ir-engine/release=${process.env.RELEASE_NAME},ir-engine/projectPublish=true`
    await createExecutorJob(app, jobBody, jobLabelSelector, 1000, newJob.id)
    logger.info(`Executer job: ${jobBody}`)
    return
  }
}

async function publishProject(
  app: Application,
  projectId: string,
  projectPublishId: string,
  userId: UserID,
  updatedAt: string,
  locations: LocationData[],
  jobId?: string
) {
  try {
    logger.info(`[ProjectPublish]: Publishing project:${projectId}...`)

    const project = await app.service(projectPath).get(projectId)

    if (!project) throw new BadRequest('Project not found.')

    if (!project.assetsOnly) throw new BadRequest('Only assets-only projects can be published.')

    await copyPublishedFiles(app, project, updatedAt)

    await updateProjectFiles(app, project, updatedAt)

    await createProjectCopy(app, project, projectPublishId, userId, updatedAt)

    await createLocations(app, project, updatedAt, locations)

    await updateProjectEntry(app, projectId, projectPublishId)

    if (jobId) {
      const date = await getDateTimeSql()
      await app.service(apiJobPath).patch(jobId, {
        status: 'succeeded',
        endTime: date
      })
    }
  } catch (err) {
    if (jobId) {
      const date = await getDateTimeSql()
      await app.service(apiJobPath).patch(jobId, {
        status: 'failed',
        returnData: err.toString(),
        endTime: date
      })
    }
    throw err
  }
}

const copyPublishedFiles = async (app: Application, project: ProjectType, updatedAt: string) => {
  const oldProject = project.name
  const oldPath = `projects/`

  await app.service(fileBrowserPath).update(null, {
    oldProject: oldProject,
    newProject: `${oldProject}-${updatedAt}`,
    oldName: `${oldProject}/`,
    newName: `${oldProject}-${updatedAt}/`,
    oldPath,
    newPath: oldPath,
    isCopy: true
  })
}

/**
 * Updates project references in JSON data
 * @param data
 * @param oldProject
 * @param newProject
 * @returns
 */
const updateProjectReferences = (data: any, oldProject: string, newProject: string) => {
  for (const [key, val] of Object.entries(data)) {
    if (val && typeof val === 'object') {
      data[key] = updateProjectReferences(val, oldProject, newProject)
    }
    if (typeof val === 'string') {
      if (val.startsWith(sceneRelativePathIdentifier + '/' + oldProject)) {
        data[key] = data[key].replace(
          sceneRelativePathIdentifier + '/' + oldProject,
          sceneRelativePathIdentifier + '/' + newProject
        )
        console.log('Updated project reference:', val, 'to', data[key])
      }
    }
  }
  return data
}

const updateProjectFiles = async (app: Application, project: ProjectType, updatedAt: string) => {
  const storageProvider = getStorageProvider()

  const scenesToInvalidate = [] as string[]

  const publishProjectName = `${project.name}-${updatedAt}`

  const scenes = (await app.service(staticResourcePath).find({
    query: {
      project: publishProjectName,
      type: 'scene'
    },
    paginate: false
  })) as any as StaticResourceType[]

  for (const scene of scenes) {
    try {
      console.log('Updating project reference in scene:', scene.key)
      const sceneKey = scene.key
      const directory = sceneKey.split('/').slice(0, -1).join('/')
      const fileName = sceneKey.split('/').slice(-1).join('')
      if (!(await storageProvider.doesExist(fileName, directory))) continue
      const sceneData = await storageProvider.getObject(sceneKey)
      const sceneJSON = JSON.parse(sceneData.Body.toString())
      updateProjectReferences(sceneJSON, project.name, publishProjectName)
      await storageProvider.putObject(
        {
          Body: Buffer.from(JSON.stringify(sceneJSON)),
          ContentType: sceneData.ContentType,
          Key: scene.key
        },
        { isDirectory: false }
      )
      scenesToInvalidate.push(scene.key)
    } catch (e) {
      console.warn('Error updating project reference in scene:', scene.key, e)
    }

    try {
      // migrate thumbnail
      const thumbnailKey = scene.thumbnailKey
      if (!thumbnailKey) continue

      if (thumbnailKey.startsWith('projects/' + project.name)) {
        const newThumbnailKey = thumbnailKey.replace('projects/' + project.name, 'projects/' + publishProjectName)

        await app
          .service(staticResourcePath)
          .patch(null, { thumbnailKey: newThumbnailKey }, { query: { key: scene.key } })
        console.log('Updated thumbnail reference:', thumbnailKey, 'to', newThumbnailKey)
      }
    } catch (e) {
      console.warn('Error updating project reference in thumbnail:', scene.key, e)
    }
  }

  await app.service(invalidationPath).create(scenesToInvalidate.map((path) => ({ path })))
}

/**
 * Creates a copy of the project with the new published project name
 * @param context
 * @returns
 */
const createProjectCopy = async (
  app: Application,
  project: ProjectType,
  projectPublishId: string,
  userId: UserID,
  updatedAt: string
) => {
  const copyProjectData: ProjectData = {
    ...project,
    id: uuidv4(),
    updatedBy: userId,
    name: `${project.name}-${updatedAt}`,
    projectPublishId: projectPublishId,
    isPublishedVersion: true,
    createdAt: await getDateTimeSql(),
    updatedAt: await getDateTimeSql()
  }

  delete copyProjectData.projectPermissions
  delete copyProjectData.settings

  await app.service(projectPath)._create(copyProjectData)
}

const createLocations = async (
  app: Application,
  project: ProjectType,
  updatedAt: string,
  locations: LocationData[]
) => {
  const scenes = (await app.service(staticResourcePath).find({
    query: {
      project: `${project.name}-${updatedAt}`,
      type: 'scene'
    },
    paginate: false
  })) as any as StaticResourceType[]

  locations.map((location) => {
    location.sceneId = scenes.find((scene) => scene.key.split('/').pop()!.replace('.gltf', '') === location.name)!.id
  })

  await app.service(locationPath).create(locations)
}

/**
 * Updates the original project to reference the new published project
 * @param context
 * @returns
 */
const updateProjectEntry = async (app: Application, projectId: string, projectPublishId: string) => {
  await app.service(projectPath).patch(projectId, { projectPublishId })
}

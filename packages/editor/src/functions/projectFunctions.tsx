import i18n from 'i18next'
import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'
import { upload } from '@xrengine/client-core/src/util/upload'
import { ProjectManager } from '../managers/ProjectManager'
import { SceneManager } from '../managers/SceneManager'
import { client } from '@xrengine/client-core/src/feathers'

/**
 * getProjects used to get list projects created by user.
 *
 * @return {Promise}
 */
export const getProjects = async (): Promise<ProjectInterface[]> => {
  try {
    const { data } = await client.service('project').find()
    return data
  } catch (error) {
    console.log('Error in Getting Project:' + error)
    throw new Error(error)
  }
}

/**
 * Function to get project data.
 *
 * @param projectId
 * @returns
 */
// export const getProject = async (projectId): Promise<ProjectInterface> => {
//   try {
//     const { data } = await client.service('project').get(projectId)
//     return data
//   } catch (error) {
//     console.log('Error in Getting Project:' + error)
//     throw new Error(error)
//   }
// }

// /**
//  * createProject used to create a project.
//  *
//  * @author Robert Long
//  * @author Abhishek Pathak
//  * @param  {any}  project         [contains the data related to project]
//  * @param  {any}  parentProjectId
//  * @param  {any}  thumbnailBlob [thumbnail data]
//  * @param  {any}  signal        [used to check if signal is not aborted]
//  * @param  {any}  showDialog    [shows the message dialog]
//  * @param  {any}  hideDialog
//  * @return {Promise}               [response as json]
//  */
// export const createProject = async (
//   project,
//   parentProjectId,
//   thumbnailBlob,
//   signal,
//   showDialog,
//   hideDialog
// ): Promise<ProjectInterface> => {
//   if (signal.aborted) {
//     throw new Error(i18n.t('editor:errors.saveProjectAborted'))
//   }

//   // uploading thumbnail providing file_id and meta
//   const {
//     file_id: thumbnailFileId,
//     meta: { access_token: thumbnailFileToken }
//   } = (await upload(thumbnailBlob, undefined, signal, 'thumbnailOwnedFileId')) as any

//   if (signal.aborted) {
//     throw new Error(i18n.t('editor:errors.saveProjectAborted'))
//   }

//   const serializedProject = await project.serialize()
//   const projectBlob = new Blob([JSON.stringify(serializedProject)], { type: 'application/json' })
//   const {
//     file_id: projectFileId,
//     meta: { access_token: projectFileToken }
//   } = (await upload(projectBlob, undefined, signal)) as any

//   if (signal.aborted) {
//     throw new Error(i18n.t('editor:errors.saveProjectAborted'))
//   }

//   const projectData = {
//     name: project.name,
//     thumbnailOwnedFileId: {
//       file_id: thumbnailFileId,
//       file_token: thumbnailFileToken
//     },
//     ownedFileIds: {},
//     project_file_id: projectFileId,
//     project_file_token: projectFileToken
//   }

//   if (parentProjectId) {
//     projectData['parent_project_id'] = parentProjectId
//   }
//   ProjectManager.instance.ownedFileIds = Object.assign(
//     {},
//     ProjectManager.instance.ownedFileIds,
//     ProjectManager.instance.currentOwnedFileIds
//   )
//   projectData.ownedFileIds = Object.assign({}, projectData.ownedFileIds, ProjectManager.instance.ownedFileIds)
//   ProjectManager.instance.currentOwnedFileIds = {}

//   try {
//     return (await client.service('project').create({ project: projectData })) as ProjectInterface
//   } catch (error) {
//     console.log('Error in Getting Project:' + error)
//     throw new Error(error)
//   }
// }

import { Params } from '@feathersjs/feathers'
import hooks from './project.hooks'
import { Application } from '../../../declarations'
import { Project } from './project.class'
import createModel from './project.model'
import projectDocs from './project.docs'
import { getAxiosConfig, populateProject } from '../content-pack/content-pack-helper'
import axios from 'axios'
import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'
import fs from 'fs'
import path from 'path'
import { isDev } from '@xrengine/common/src/utils/isDev'

declare module '../../../declarations' {
  interface ServiceTypes {
    project: Project
  }
}

// export const addProject = (app: any): any => {
//   return async (data: { uploadURL: string }, params: Params) => {
//     try {
//       const manifestData = await axios.get(data.uploadURL, getAxiosConfig())
//       const manifest = JSON.parse(manifestData.data.toString()) as ProjectInterface
//       await populateProject({ name: manifest.name, manifest: data.uploadURL }, app, params)
//     } catch (error) {
//       console.log(error)
//       return false
//     }
//     return true
//   }
// }

// export const getInstalledProjects = (projectClass: Project) => {
// }

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const projectClass = new Project(options, app)
  projectClass.docs = projectDocs

  app.use('project', projectClass)

  // @ts-ignore
  // app.use('upload-project', {
  //   create: addProject(app)
  // })

  // // @ts-ignore
  // app.use('project-data', {
  //   find: getInstalledProjects(projectClass)
  // })

  const service = app.service('project')

  service.hooks(hooks)
}

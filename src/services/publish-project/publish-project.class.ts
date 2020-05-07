import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers'
import { Forbidden } from '@feathersjs/errors'
import { Transaction } from 'sequelize/types'
import { Application } from '../../declarations'
import { mapProjectDetailData, defaultProjectImport } from '../project/project-helper'
import { extractLoggedInUserFromParams } from '../auth-management/auth-management.utils'
interface Data {}

interface ServiceOptions {}

export class PublishProject implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }

  async find (params?: Params): Promise<Data[] | Paginated<Data>> {
    return []
  }

  async get (id: Id, params?: Params): Promise<Data> {
    return {
      id, text: `A new message with ID: ${id}!`
    }
  }

  async create (data: Data, params: Params): Promise<Data> {
    const ProjectModel = this.app.service('/api/v1/projects').Model
    const SceneModel = this.app.service('scene').Model
    const projectId = params?.query?.projectId
    const loggedInUser = extractLoggedInUserFromParams(params)
    const project = await ProjectModel.findOne({ where: { project_sid: projectId, created_by_account_id: loggedInUser.userId } })

    if (!project) {
      return await Promise.reject(new Forbidden('Project not found Or you don\'t have access!'))
    }

    if (!project) {
      return await Promise.reject(new Forbidden('Project not found Or you don\'t have access!'))
    }

    await this.app.get('sequelizeClient').transaction(async (trans: Transaction) => {
      const savedScene = await SceneModel.create(data, {
        transaction: trans,
        fields: ['screenshot_owned_file_id', 'model_owned_file_id', 'scene_owned_file_id', 'allow_remixing', 'allow_promotion', 'name', 'account_id', 'slug', 'state', 'scene_id', 'scene_sid']
      })
      project.scene_id = savedScene.scene_id

      await project.save({ transaction: trans })
    })

    const projectData = await ProjectModel.findOne({
      where: {
        project_sid: project.project_sid
      },
      attributes: ['name', 'project_id', 'project_sid'],
      include: defaultProjectImport(this.app.get('sequelizeClient').models)
    })
    return mapProjectDetailData(projectData.toJSON())
  }

  async update (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data
  }

  async patch (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data
  }

  async remove (id: NullableId, params?: Params): Promise<Data> {
    return { id }
  }
}
